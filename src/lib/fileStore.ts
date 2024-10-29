/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";

export class BaseFileStore<T = any> {
  public fileName: string;

  constructor(fileName: string) {
    this.fileName = fileName;
  }

  read() {
    if (!fs.existsSync(this.filePath)) {
      console.log(this.filePath, "not exists");
      return undefined;
    }
    const result = fs.readFileSync(this.filePath, "utf8");
    return JSON.parse(result) as T;
  }

  write(data: T) {
    if (!fs.existsSync(this.directoryPath)) {
      fs.mkdirSync(this.directoryPath);
    }
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2)); // just to make it easier to read
  }

  get filePath() {
    return path.join(this.directoryPath, this.fileName);
  }

  get directoryPath() {
    return path.join(process.cwd(), "tmp");
  }
}
