//model class
class EditorUtilities {
  constructor(chunk) {
    this.imgMetadata = chunk.slice(0, 54);
    this.pixelData = chunk.slice(54);
  }

  increaseBrightness() {
    this.pixelData.forEach((_, index) => {
      this.pixelData[index] = Math.min(this.pixelData[index] * 2, 255); //incr brightness
    });
    return [...this.imgMetadata, ...this.pixelData];
  }

  reduceBrightness() {
    this.pixelData.forEach((_, index) => {
      this.pixelData[index] = Math.max(this.pixelData[index] * 0.5, 0); //red brightness
    });
    return [...this.imgMetadata, ...this.pixelData];
  }
}

//controller class
class ImageEditor {
  constructor(inputPath, outputPath) {
    this.inputPath = inputPath;
    this.outputPath = outputPath;
  }

  async startProcessing() {
    const fsFileObject = await Deno.open(this.inputPath);
    const outputFile = await Deno.open(this.outputPath, {
      write: true,
      create: true,
    });
    fsFileObject.readable
      .pipeThrough(this.processImage)
      .pipeTo(outputFile.writable);
  }

  processImage = new TransformStream({
    transform(chunk, controller) {
      const imageChunk = new EditorUtilities(chunk);
      const editedImage = imageChunk.reduceBrightness();
      controller.enqueue(new Uint8Array(editedImage));
    },
  });

  // await this.writeToFile(editedImage);
  // }
  // async writeToFile(inputFileData) {
  //   const outputFile = await Deno.open(this.outputPath, {
  //     write: true,
  //     create: true,
  //   });
  //   const writer = outputFile.writable.getWriter();
  //   for (const chunk of inputFileData) {
  //     await writer.write(new Uint8Array(chunk));
  //   }
  // }
}

const main = async () => {
  const editor = new ImageEditor(
    "assets/blackbuck.bmp",
    "assets/editedBlackbuck.bmp"
  );
  await editor.startProcessing();
};

main();
