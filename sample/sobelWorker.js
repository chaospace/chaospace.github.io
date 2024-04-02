importScripts("./d3-delaunay.min.js");
self.onmessage = (event) => {
  const { data, width, height, pointNum, iterations } = event.data;

  const it = self.method(data, pointNum, width, height, iterations);
  let result;
  do {
    result = it.next();
    postMessage(result.value);
  } while (!result.done);
};

self.method = function* (data, pointNum, width, height, iterations) {
  const points = new Float64Array(pointNum * 2);

  //포인트 생성
  for (let i = 0; i < pointNum; i++) {
    let x = 0;
    let y = 0;
    for (let j = 0, rejected = true; (j < 100) & rejected; j++) {
      x = Math.random() * width;
      y = Math.random() * height;
      const val = data[(y | 0) * width + (x | 0)] || 0;
      rejected = Math.random() >= val;
    }
    points[i * 2] = x;
    points[i * 2 + 1] = y;
  }

  const delaunay = new d3.Delaunay(points);
  const voronoi = delaunay.voronoi([0, 0, width, height]);
  const weights = new Float64Array(pointNum);
  const weightedCoordinates = new Float32Array(pointNum * 2);
  const velocities = new Float64Array(pointNum * 2);
  const speedLimit = (2 * Math.sqrt((width * height) / pointNum)) / Math.PI;

  for (let iter = 0; iter < iterations; iter++) {
    weights.fill(0);
    weightedCoordinates.fill(0);

    for (let y = 0, idx = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const w = data[y * width + x];
        idx = delaunay.find(x + 0.5, y + 0.5, idx);
        if (w) {
          weights[idx] += w;
          weightedCoordinates[idx * 2] += w * (x + 0.5);
          weightedCoordinates[idx * 2 + 1] += w * (y + 0.5);
        }
      }
    }

    for (let i = 0; i < pointNum; i++) {
      let x0 = points[i * 2];
      let y0 = points[i * 2 + 1];
      let x1 = x0;
      let y1 = y0;
      const w = weights[i];
      if (w) {
        x1 = weightedCoordinates[i * 2] / w;
        y1 = weightedCoordinates[i * 2 + 1] / w;
      }

      const dx = x1 - x0;
      const dy = y1 - y0;
      let vx = velocities[i * 2];
      let vy = velocities[i * 2 + 1];
      vx = vx * 0.8 + dx;
      vy = vy * 0.8 + dy;
      x1 = x0 + vx;
      y1 = y0 + vy;

      if (x1 <= 1) {
        x1 = 1 + Math.random();
        vx = 0;
        vy = 0;
      } else if (x1 >= width - 2) {
        x1 = width - 2 - Math.random();
        vx = 0;
        vy = 0;
      }
      if (y1 <= 1) {
        y1 = 1 + Math.random();
        vx = 0;
        vy = 0;
      } else if (y1 >= height - 2) {
        y1 = height - 2 - Math.random();
        vx = 0;
        vy = 0;
      }
      let speed = Math.sqrt(vx * vx + vy * vy) || 0;
      if (speed > speedLimit) {
        speed = speedLimit / speed;
        vx *= speed;
        vy *= speed;
      }
      velocities[i * 2] = vx;
      velocities[i * 2 + 1] = vy;
      points[i * 2] = x1;
      points[i * 2 + 1] = y1;
    }

    voronoi.update();

    if (iter < 80 || iter % 16 === 0 || iter + 1 === iterations) {
      yield { points, weights };
    }
  }
};
