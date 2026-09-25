import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const sourcePath = process.argv[2];
const presentation = await PresentationFile.importPptx(await FileBlob.load(sourcePath));
const result = await presentation.inspect({ kind: "slide,textbox,shape,image,table,chart,notes,layout", maxChars: 30000 });
console.log(result.ndjson);
