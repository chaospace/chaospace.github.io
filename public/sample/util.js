function blurLinearRGB(lrgb, width, height, radius) {
  if (!(radius > 0)) return lrgb;

  const widthMinus1 = (width - 1) | 0;
  const heightMinus1 = (height - 1) | 0;
  const blurWidth = (radius + radius + 1) | 0;
  const weights = new Float32Array(blurWidth);
  {
    const pyramidWidth = (radius + 1) | 0;
    const pyramidRadius = pyramidWidth >>> 1;
    const pyramidWeights = new Uint32Array(pyramidWidth);
    for (let i = 0; i < pyramidWidth - pyramidRadius; i++) {
      for (let j = 0; j < pyramidRadius; j++) {
        pyramidWeights[i + j]++;
      }
    }

    for (let i = 0; i < blurWidth - pyramidWidth; i++) {
      for (let j = 0; j < pyramidWidth; j++) {
        weights[i + j] += pyramidWeights[j];
      }
    }
  }

  let norm = 0;
  for (let i = 0; i < weights.length; i++) {
    for (let j = 0; j < weights.length; j++) {
      norm += weights[i] * weights[j];
    }
  }

  const buffer = new Float64Array(lrgb.length);

  // blur columns
  for (let y = 0; y < height; y++) {
    const yIdx = y * width;
    for (let x = 0; x < width; x++) {
      const targetIdx = (x + yIdx) * 3;
      for (let i = -radius; i <= radius; i++) {
        const weight = weights[i + radius];
        const xIdx = Math.min(widthMinus1, Math.max(0, x + i));
        const sourceIdx = (xIdx + yIdx) * 3;
        buffer[targetIdx] += weight * lrgb[sourceIdx];
        buffer[targetIdx + 1] += weight * lrgb[sourceIdx + 1];
        buffer[targetIdx + 2] += weight * lrgb[sourceIdx + 2];
      }
    }
  }

  // blur rows
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let r = 0,
        g = 0,
        b = 0;
      const targetIdx = (x + y * width) * 3;
      for (let i = -radius; i <= radius; i++) {
        const weight = weights[i + radius];
        const yIdx = Math.min(heightMinus1, Math.max(0, y + i)) * width;
        const sourceIdx = (x + yIdx) * 3;
        r += weight * buffer[sourceIdx];
        g += weight * buffer[sourceIdx + 1];
        b += weight * buffer[sourceIdx + 2];
      }
      lrgb[targetIdx] = (r / norm) | 0;
      lrgb[targetIdx + 1] = (g / norm) | 0;
      lrgb[targetIdx + 2] = (b / norm) | 0;
    }
  }

  return lrgb;
}

function imageSobel(
  imageLinear,
  sobelImageData,
  blurLinearRGB,
  width,
  height,
  blurStrength,
  normSobel,
  blurStrength2,
  clampSobel
) {
  let { rgb } = imageLinear(sobelImageData);

  const blurredRGB = rgb.slice(0);
  blurLinearRGB(blurredRGB, width, height, blurStrength);

  const blurredRGB2 = normSobel ? rgb.slice(0) : undefined;
  if (normSobel) {
    blurLinearRGB(blurredRGB2, width, height, blurStrength2);
  }

  rgb = blurredRGB;
  const sobel = new Float64Array(width * height);

  let minSobel = 196605 * 3;
  let maxSobel = 0;

  // Convert to sobel values
  // theoretical maximum value: 255² * four pixel comparisons * three color channels
  const rgbLine = width * 3;
  for (let y = 1; y < height - 1; y++) {
    const sobelLineIdx = y * width;
    const lineIdx = sobelLineIdx + sobelLineIdx + sobelLineIdx;
    // We're going to re-use these variables to reduce array look ups
    let R = rgb[lineIdx];
    let G = rgb[lineIdx + 1];
    let B = rgb[lineIdx + 2];
    let Rpx = rgb[lineIdx + 3];
    let Gpx = rgb[lineIdx + 4];
    let Bpx = rgb[lineIdx + 5];

    for (let x = 1; x < width - 1; x++) {
      const sobelIdx = x + sobelLineIdx;
      const rgbIdx = sobelIdx * 3;
      // We are scanning left to right, so we can re-use the previous x-values like this
      let Rmx = R;
      let Gmx = G;
      let Bmx = B;
      R = Rpx;
      G = Gpx;
      B = Bpx;
      // Get red green and blue channels, including for the pixels next to the current one
      // Doing it in this order should be a bit more cache friendly.
      let Rmy = rgb[rgbIdx - rgbLine];
      let Gmy = rgb[rgbIdx - rgbLine + 1];
      let Bmy = rgb[rgbIdx - rgbLine + 2];
      Rpx = rgb[rgbIdx + 3];
      Gpx = rgb[rgbIdx + 4];
      Bpx = rgb[rgbIdx + 5];
      let Rpy = rgb[rgbIdx + rgbLine];
      let Gpy = rgb[rgbIdx + rgbLine + 1];
      let Bpy = rgb[rgbIdx + rgbLine + 2];

      // As before, we normalize to 1 (using max.sobel in this case), but don't
      // convert back from the linear color space
      let val = Math.max(
        0,
        Math.abs(R - Rmy) +
          Math.abs(R - Rmx) +
          Math.abs(R - Rpx) +
          Math.abs(R - Rpy) +
          Math.abs(G - Gmy) +
          Math.abs(G - Gmx) +
          Math.abs(G - Gpx) +
          Math.abs(G - Gpy) +
          Math.abs(B - Bmy) +
          Math.abs(B - Bmx) +
          Math.abs(B - Bpx) +
          Math.abs(B - Bpy)
      );
      if (val > maxSobel) maxSobel = val;
      if (val < minSobel) minSobel = val;

      sobel[sobelIdx] = val;
    }
  }

  if (!normSobel) {
    // normalize sobel the "plain" way
    if (!(maxSobel > 0)) {
      sobel.fill(0);
    } else {
      const norm = 100 / (clampSobel * maxSobel);
      for (let i = 0; i < sobel.length; i++) {
        sobel[i] = Math.min(1.0, sobel[i] * norm);
      }
    }
  } else {
    // Locally normalize sobel based on *other* blurred sobel image.

    const rgb2 = blurredRGB2;
    const sobel2 = new Float64Array(width * height);

    let minSobel2 = 196605 * 3;
    let maxSobel2 = 0;
    // Convert rgb2 to sobel values
    // theoretical maximum value: 255² * four pixel comparisons * three color channels
    const rgbLine = width * 3;
    for (let y = 1; y < height - 1; y++) {
      const sobelLineIdx = y * width;
      const lineIdx = sobelLineIdx + sobelLineIdx + sobelLineIdx;
      // We're going to re-use these variables to reduce array look ups
      let R = rgb2[lineIdx];
      let G = rgb2[lineIdx + 1];
      let B = rgb2[lineIdx + 2];
      let Rpx = rgb2[lineIdx + 3];
      let Gpx = rgb2[lineIdx + 4];
      let Bpx = rgb2[lineIdx + 5];

      for (let x = 1; x < width - 1; x++) {
        const sobelIdx = x + sobelLineIdx;
        const rgbIdx = sobelIdx * 3;
        // We are scanning left to right, so we can re-use the previous x-values like this
        let Rmx = R;
        let Gmx = G;
        let Bmx = B;
        R = Rpx;
        G = Gpx;
        B = Bpx;
        // Get red green and blue channels, including for the pixels next to the current one
        // Doing it in this order should be a bit more cache friendly.
        let Rmy = rgb2[rgbIdx - rgbLine];
        let Gmy = rgb2[rgbIdx - rgbLine + 1];
        let Bmy = rgb2[rgbIdx - rgbLine + 2];
        Rpx = rgb2[rgbIdx + 3];
        Gpx = rgb2[rgbIdx + 4];
        Bpx = rgb2[rgbIdx + 5];
        let Rpy = rgb2[rgbIdx + rgbLine];
        let Gpy = rgb2[rgbIdx + rgbLine + 1];
        let Bpy = rgb2[rgbIdx + rgbLine + 2];

        // As before, we normalize to 1 (using max.sobel in this case), but don't
        // convert back from the linear color space
        let val = Math.max(
          0,
          Math.abs(R - Rmy) +
            Math.abs(R - Rmx) +
            Math.abs(R - Rpx) +
            Math.abs(R - Rpy) +
            Math.abs(G - Gmy) +
            Math.abs(G - Gmx) +
            Math.abs(G - Gpx) +
            Math.abs(G - Gpy) +
            Math.abs(B - Bmy) +
            Math.abs(B - Bmx) +
            Math.abs(B - Bpx) +
            Math.abs(B - Bpy)
        );
        if (val > maxSobel2) maxSobel2 = val;
        if (val < minSobel2) minSobel2 = val;
        sobel2[sobelIdx] = val;
      }
    }
    // normalize sobel
    if (!(maxSobel > 0)) {
      sobel.fill(0);
    } else {
      maxSobel = 0;
      for (let i = 0; i < sobel.length; i++) {
        const val = Math.max(0, (sobel[i] + 1) / (1 + sobel2[i]) - 1);
        sobel[i] = val;
        if (val > maxSobel) maxSobel = val;
      }
      const norm = 100 / (clampSobel * maxSobel);
      for (let i = 0; i < sobel.length; i++) {
        sobel[i] = Math.min(1.0, sobel[i] * norm);
      }
    }
  }

  return { sobel: Float32Array.from(sobel) };
}
