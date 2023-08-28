
/**
 * Converts an sRGB value to linear color space
 * Assumes the value is in in the range [0-255]
 */
const toLinear = (c: number) => {
    c /= 255;
    if (c > 0.04045)
        return Math.pow(((c + 0.055) / 1.055), 2.4);
    else
        return c / 12.92;
}

/**
 * Converts a linear value to sRGB value
 * Assumes the value is in the range [0-1.0]
 */
const tosRGB = (c: number) => {
    if (c > 0.0031308) {
        c = (1.055 * Math.pow(c, 1.0 / 2.4)) - 0.055;
        return (c << 8) - c;
    }
    return c * 12.92 * 255;
}


const tosRGBLinear = (rgba: ImageData) => {
    const { width, height, data } = rgba;
    const rgb = new Uint16Array(width * height * 3);
    let max = 0;
    let min = (256 ** 2 - 1) * 3;
    for (let i = 0; i < width * height; i++) {
        let idx = i << 2; // *4
        let r = data[idx] + 1; // 1 ~ 256으로 조절
        r = r * r - 1;         // 0**2 ~ 255**2 사이값으로 조정

        let g = data[idx + 1] + 1;
        g = g * g - 1;

        let b = data[idx + 2] + 1;
        b = b * b - 1;

        idx = (i << 1) + i; // idx값을 3의 배수로 조정
        rgb[idx] = r;
        rgb[idx + 1] = g;
        rgb[idx + 2] = b;
        const sum = r + g + b;
        if (sum > max) max = sum;
        if (sum < min) min = sum;
    }

    return {
        rgb,
        min,
        max
    }
}

const toLinearGrayColor = (rgba: ImageData) => {
    const { rgb, max, min } = tosRGBLinear(rgba);
    const { width, height } = rgba;

    const invert = new Float32Array(width * height);
    const normal = new Float32Array(width * height);

    const ratio = 1 / (max - min);
    for (let i = 0; i < invert.length; i++) {
        let idx = (i << 1) + i; //3의 배수 처리
        let color = rgb[idx] + rgb[idx + 1] + rgb[idx + 2];
        normal[i] = (color - min) * ratio;
        invert[i] = (max - color) * ratio;
    }

    return {
        normal,
        invert
    }
}


const blurLinearRGB = (lrgb: Uint16Array, width: number, height: number, radius = 2) => {

    if ((radius < 0)) return lrgb;
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

/**
 * 
 * @param sobelImageData 필터를 적용할 이미지 데이터 
 * @param blurStrength 블러 값
 * @param normalSobel 노멀라이즈 적용여부
 * @param blurStrength2 노멀라이즈 시  사용할 블러 값
 * @param clampSobel 소벨 임계값
 * @returns 
 */
const toSobelImageData = (sobelImageData: ImageData, blurStrength = 2, normalSobel = false, blurStrength2 = 2, clampSobel = 50) => {
    let { rgb } = tosRGBLinear(sobelImageData);

    const blurredRGB = rgb.slice(0);
    const { width, height } = sobelImageData;
    blurLinearRGB(blurredRGB, width, height, blurStrength);

    const blurredRGB2 = normalSobel ? rgb.slice(0) : undefined;
    if (normalSobel && blurredRGB2) {
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

    if (!normalSobel) {
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

        const rgb2 = blurredRGB2!;
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

const getPolygonCentroid = (cell: number[][]) => {

    let x = cell[0][0];
    let y = cell[0][1];
    for (let i = 1; i < cell.length; i++) {
        x += cell[i][0];
        y += cell[i][1];
    }

    return [x / cell.length, y / cell.length];
}



const grayScaleFilter = (imageData: ImageData) => {
    const { width, height } = imageData;
    const output = new ImageData(width, height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const r = imageData.data[index] * 0.2126;
            const g = imageData.data[index + 1] * .0715;
            const b = imageData.data[index + 2] * .0722;
            const sum = (r + g + b);
            output.data[index] = sum;
            output.data[index + 1] = sum;
            output.data[index + 2] = sum;
            output.data[index + 3] = 255;
        }
    }
    return output;
}


const setLinearImageData = (input: Uint8ClampedArray, palette: Float32Array) => {
    for (let i = 0; i < palette.length; i++) {
        const c = palette[i] * 255;
        const idx = i << 2;
        input[idx] = c;
        input[idx + 1] = c;
        input[idx + 2] = c;
        input[idx + 3] = 255;
    }
    return input;
};


const getColorWeights = (imageData: ImageData) => {
    const max = imageData.width * imageData.height;
    const colorWeights = new Float64Array(max);
    for (let i = 0; i < max; i++) {
        const color = imageData.data[i * 4];
        colorWeights[i] = color / 255;
    }
    return colorWeights;
}

const getThreshold = (imageData: ImageData, threshold: number) => {
    const { width, height } = imageData;
    const output = new ImageData(width, height);
    for (let i = 0; i < imageData.data.length; i++) {
        const idx = i * 4;
        const color = imageData.data[idx];
        if (color > threshold) {
            output.data[idx] = color;
            output.data[idx + 1] = color;
            output.data[idx + 2] = color;
        } else {
            output.data[idx] = 0;
            output.data[idx + 1] = 0;
            output.data[idx + 2] = 0;
        }
    }
    return output;
}




const readImageFileAsync = (url: string) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = url;
    });

}



export { readImageFileAsync, getPolygonCentroid, setLinearImageData, toLinearGrayColor, tosRGBLinear, toSobelImageData, toLinear, tosRGB, grayScaleFilter, getColorWeights, getThreshold };