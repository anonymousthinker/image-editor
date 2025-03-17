//model class
class EditorUtilities {
  constructor(chunk) {
    this.imgMetadata = chunk.slice(0, 54);
    this.imgPixelData = chunk.slice(54);
  }

  increaseBrightness() {
    const newImageData = this.imgPixelData.map((pixel) =>
      Math.min(pixel * 2, 255)
    );

    return [...this.imgMetadata, ...newImageData];
  }

  reduceBrightness() {
    const newImageData = this.imgPixelData.map((pixel) =>
      Math.max(pixel * 0.5, 0)
    );

    return [...this.imgMetadata, ...newImageData];
  }

  increaseContrast() {
    const threshold = Math.floor(255 / 2);

    const newImageData = this.imgPixelData.map((pixel) => {
      return pixel < threshold
        ? Math.max(pixel * 0.8, 0)
        : Math.min(pixel * 1.5, 255);
    });

    return [...this.imgMetadata, ...newImageData];
  }

  reduceContrast() {
    const threshold = Math.floor(255 / 2);

    const newImageData = this.imgPixelData.map((pixel) => {
      return pixel < threshold
        ? Math.min(pixel * 2, 255)
        : Math.max(pixel * 0.8, 0);
    });

    return [...this.imgMetadata, ...newImageData];
  }
}

//controller class
class ImageEditor {
  constructor(inputPath, outputPath) {
    this.inputPath = inputPath;
    this.outputPath = outputPath;
  }

  async processImage(editType) {
    const fsFileObject = await Deno.open(this.inputPath);
    const outputFile = await Deno.open(this.outputPath, {
      write: true,
      create: true,
    });

    const processImage = new TransformStream({
      transform(chunk, controller) {
        const imageChunk = new EditorUtilities(chunk);

        const allEdits = {
          increase_brightness: "increaseBrightness",
          reduce_brightness: "reduceBrightness",
          increase_contrast: "increaseContrast",
          reduce_contrast: "reduceContrast",
        };

        const editedImage = imageChunk[allEdits[editType]]();

        controller.enqueue(new Uint8Array(editedImage));
      },
    });

    fsFileObject.readable.pipeThrough(processImage).pipeTo(outputFile.writable);
  }
}

const main = async (args) => {
  const [inputFile, outputFile, editType] = args;
  const editor = new ImageEditor(inputFile, outputFile);

  await editor.processImage(editType);
};

main(Deno.args);
