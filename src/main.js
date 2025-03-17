//model class
class EditorUtilities {
  constructor(chunk) {
    this.imgMetadata = chunk.slice(0, 54);
    this.imgPixelData = chunk.slice(54);
  }

  increaseBrightness() {
    this.imgPixelData.forEach((_, index) => {
      this.imgPixelData[index] = Math.min(this.imgPixelData[index] * 2, 255);
    });
    return [...this.imgMetadata, ...this.imgPixelData];
  }

  reduceBrightness() {
    this.imgPixelData.forEach((_, index) => {
      this.imgPixelData[index] = Math.max(this.imgPixelData[index] * 0.5, 0);
    });
    return [...this.imgMetadata, ...this.imgPixelData];
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
