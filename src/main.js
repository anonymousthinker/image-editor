//model class
class EditModel {
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
}

//controller class
class EditController {
  constructor(inputPath, outputPath) {
    this.inputPath = inputPath;
    this.outputPath = outputPath;
  }

  async readFromFile() {
    const fsFileObject = await Deno.open(this.inputPath);
    const fileData = [];
    for await (const chunk of fsFileObject.readable) {
      fileData.push(chunk);
    }
    return fileData;
  }

  processImage(inputFileData) {
    const editedImage = [];
    for (const chunk of inputFileData) {
      const imageChunk = new EditModel(chunk);
      editedImage.push(imageChunk.increaseBrightness());
    }
    return editedImage;
  }

  async writeToFile(inputFileData) {
    const outputFile = await Deno.open(this.outputPath, {
      write: true,
      create: true,
    });
    const writer = outputFile.writable.getWriter();
    for (const chunk of inputFileData) {
      await writer.write(new Uint8Array(chunk));
    }
  }
}

const main = async () => {
  const filePaths = new EditController(
    "assets/blackbuck.bmp",
    "assets/editedBlackbuck.bmp"
  );
  const inputFileData = await filePaths.readFromFile();
  const processedImage = filePaths.processImage(inputFileData);
  filePaths.writeToFile(processedImage); //will be handle by view class
};

main();
