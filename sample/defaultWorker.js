importScripts("./d3-delaunay.min.js");
self.onmessage = (event) => {
  const { data, width, height, pointNum, iterations } = event.data;

  const points = new Float64Array(pointNum * 2);

  //포인트 생성
  for (let i = 0; i < pointNum; i++) {
    let x = 0;
    let y = 0;
    for (let j = 0, rejected = true; (j < 100) & rejected; j++) {
      x = Math.floor(Math.random() * width);
      y = Math.floor(Math.random() * height);
      const val = data[y * width + x];
      rejected = Math.random() > val ** 2;
    }
    points[i * 2] = x;
    points[i * 2 + 1] = y;
  }

  const delaunay = new d3.Delaunay(points);
  const voronoi = delaunay.voronoi([0, 0, width, height]);
  const it = self.method(
    data,
    delaunay,
    voronoi,
    pointNum,
    width,
    height,
    points,
    iterations
  );
  let result;
  do {
    result = it.next();
    postMessage(result.value);
  } while (!result.done);
};

self.method = function* (
  data,
  delaunay,
  voronoi,
  pointNum,
  width,
  height,
  points,
  iterations
) {
  const weights = new Float64Array(pointNum);
  const weightedCoordinates = new Float64Array(pointNum * 2);
  for (let iter = 0; iter < iterations; iter++) {
    weights.fill(0);
    weightedCoordinates.fill(0);

    for (let y = 0, idx = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const w = data[y * width + x];
        if (w) {
          idx = delaunay.find(x + 0.5, y + 0.5, idx);
          weights[idx] += w;
          weightedCoordinates[idx * 2] += w * (x + 0.5);
          weightedCoordinates[idx * 2 + 1] += w * (y + 0.5);
        }
      }
    }

    const e = Math.pow(iter + 1, -0.8) * 10;
    for (let i = 0; i < pointNum; i++) {
      let x0 = points[i * 2];
      let y0 = points[i * 2 + 1];
      const w = weights[i];
      if (w) {
        x0 = x0 * 0.0625 + (0.9375 * weightedCoordinates[i * 2]) / w;
        y0 = y0 * 0.0625 + (0.9375 * weightedCoordinates[i * 2 + 1]) / w;
      }
      // else {
      //     x0 = points[i * 2];
      //     y0 = points[i * 2 + 1];
      //   }

      points[i * 2] = x0 + (Math.random() - 0.5) * e;
      points[i * 2 + 1] = y0 + (Math.random() - 0.5) * e;
    }

    voronoi.update();

    if (iter < 80 || iter % 16 === 0 || iter + 1 === iterations) {
      //postMessage(points);
      yield { points, weights };
    }
  }
};
