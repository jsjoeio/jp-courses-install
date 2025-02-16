// Integration Tests
// Anything that isn't a full e2e but might rely on something else
// i.e. main because it calls other functions
import { main } from "../main.ts";
import {
  downloadZipFromLink,
  getDryRunEnv,
  unZipCourse,
  verifyPracticeContent,
} from "../lib/utils.ts";
import { CourseConfig, VerifyPurchase } from "../lib/types.ts";
import {
  COULD_NOT_VERIFY_PAYMENT_ID,
  DIRECTORY_NOT_FOUND,
  DRY_RUN_ENV_KEY,
  ERROR_MESSAGE_TEMPLATE,
  FILE_NOT_FOUND,
  HELP_MESSAGE,
  MISSING_DOWNLOAD_LINK,
  START_WITH_NO_CONTENT_DIR,
  SUCCESS_MESSAGE,
  TEST_WITH_NO_PRACTICE_DIR,
  UNSUPPORTED_ARG,
} from "../lib/constants.ts";
import { exists } from "https://deno.land/std@0.93.0/fs/mod.ts";
import { assertEquals } from "https://deno.land/std@0.93.0/testing/asserts.ts";
import { JSZip } from "https://deno.land/x/jszip@0.9.0/mod.ts";

import {
  afterEach,
  beforeEach,
  describe,
  test,
} from "https://x.nest.land/hooked-describe@0.1.0/mod.ts";

describe("main", () => {
  test("should log an error if cannot verify purchase", async () => {
    // TODO eventually mock fetch
    // because this will fail otherwise
    // Save the real console.error
    // to restore later
    const paymentId =
      "cs_live_a1VHFUz7lYnXOL3PUus13VbktedDQDubwfew8E70EvnS1BTOfNTSUJqO2i";
    const args = [
      "--paymentId",
      paymentId,
    ];
    const expectedMesage = COULD_NOT_VERIFY_PAYMENT_ID(paymentId);
    const error = console.error;

    let errorMessage = null;

    console.error = (x) => {
      errorMessage = x;
    };

    await main(args);

    console.error = error;
    assertEquals(errorMessage, `${ERROR_MESSAGE_TEMPLATE} ${expectedMesage}`);
  });
  test("should log an error if cannot verify purchase", async () => {
    // TODO eventually mock fetch
    // because this will fail otherwise
    // Save the real console.error
    // to restore later
    const paymentId =
      "cs_live_a1VHFUz7lYnXOL3PUus13VbktedDQDubwfew8E70EvnS1BTOfNTSUJqO2i";
    const args = [
      "--paymentId",
      paymentId,
    ];
    const expectedMesage = COULD_NOT_VERIFY_PAYMENT_ID(paymentId);
    const error = console.error;

    let errorMessage = null;

    console.error = (x) => {
      errorMessage = x;
    };

    await main(args);

    console.error = error;
    assertEquals(errorMessage, `${ERROR_MESSAGE_TEMPLATE} ${expectedMesage}`);
  });
  test("should take a --help flag", async () => {
    // Save the real console.log
    // to restore later
    let message = null;
    let errorMessage = null;
    const log = console.log;
    const error = console.error;

    console.log = (x) => {
      message = x;
    };
    console.error = (x) => {
      errorMessage = x;
    };

    // Call main with the --help flag
    await main(["--help"]);

    console.log = log;
    console.error = error;
    assertEquals(message, HELP_MESSAGE);
    assertEquals(errorMessage, null);
  });
  test("should take a -h flag (short for --help)", async () => {
    // Save the real console.log
    // to restore later
    let message = null;
    let errorMessage = null;
    const log = console.log;
    const error = console.error;

    console.log = (x) => {
      message = x;
    };
    console.error = (x) => {
      errorMessage = x;
    };

    // Call main with the --help flag
    await main(["-h"]);

    console.log = log;
    console.error = error;
    assertEquals(message, HELP_MESSAGE);
    assertEquals(errorMessage, null);
  });
  test("should take a --dry-run flag and set DRY_RUN", async () => {
    await main(["--dry-run"]);
    const DRY_RUN = getDryRunEnv();

    assertEquals(DRY_RUN, "0");

    // Clean up
    Deno.env.delete(DRY_RUN_ENV_KEY);
  });
  test("should take a --dryRun flag and set DRY_RUN", async () => {
    await main(["--dryRun"]);
    const DRY_RUN = getDryRunEnv();

    assertEquals(DRY_RUN, "0");

    // Clean up
    Deno.env.delete(DRY_RUN_ENV_KEY);
  });
  test("should log function calls if DRY_RUN is set", async () => {
    const messages = [];
    const log = console.log;
    console.log = (x) => {
      messages.push(x);
    };

    await main(["--dryRun"]);
    const DRY_RUN = getDryRunEnv();

    assertEquals(DRY_RUN, "0");

    assertEquals(messages.length, 5);

    console.log = log;
    // Clean up
    Deno.env.delete(DRY_RUN_ENV_KEY);
  });
  test("should not set DRY_RUN env if flag not passed", async () => {
    // Save the real console.log
    // to restore later
    let message = null;
    let errorMessage = null;
    const log = console.log;
    const error = console.error;

    console.log = (x) => {
      message = x;
    };
    console.error = (x) => {
      errorMessage = x;
    };

    // Call main with the --help flag
    await main(["--help"]);

    const DRY_RUN = getDryRunEnv();

    console.log = log;
    console.error = error;
    assertEquals(DRY_RUN, undefined);
    assertEquals(message, HELP_MESSAGE);
    assertEquals(errorMessage, null);
  });
  test("should log an error for unsupported flags", async () => {
    // Save the real console.error
    // to restore later
    const arg = "--yolo";
    const expectedMesage = UNSUPPORTED_ARG(arg);
    const error = console.error;

    let errorMessage = null;

    console.error = (x) => {
      errorMessage = x;
    };

    await main([arg]);

    console.error = error;
    assertEquals(errorMessage, `${ERROR_MESSAGE_TEMPLATE} ${expectedMesage}`);
  });
  test("should log the help message if called with an empty string or no args", async () => {
    // Save the real console.log
    // to restore later
    let message = null;
    let errorMessage = null;
    const log = console.log;
    const error = console.error;

    console.log = (x) => {
      message = x;
    };
    console.error = (x) => {
      errorMessage = x;
    };

    // Call main with the --help flag
    await main([""]);

    console.log = log;
    console.error = error;
    assertEquals(message, HELP_MESSAGE);
    assertEquals(errorMessage, null);
  });
  test("should download, unzip the course, remove zip and log success message", async () => {
    let message = null;
    const log = console.log;
    const pathToZip = "./course.zip";
    const pathToUnzipped = "./course";

    console.log = (x) => {
      message = x;
    };
    // Call main with the --help flag
    await main([
      "--paymentId",
      "cs_live_a1VHFUz7lYnXOL3PUus13VbktedDQDubwfew8E70EvnS1BTOfNTSUXqO0i",
    ]);

    const zipExists = await exists(pathToZip);
    assertEquals(zipExists, false);

    const unZippedExists = await exists(pathToUnzipped);
    assertEquals(unZippedExists, true);

    assertEquals(message, SUCCESS_MESSAGE);

    console.log = log;
    // Clean up
    Deno.remove(pathToUnzipped, { recursive: true });
  });
  test("should log an error if 'start' called in directory with no /content dir", async () => {
    // Save the real console.error
    // to restore later
    const arg = "start";
    const currentDir = "/Users/jp/Dev/jp-courses-install";
    const expectedMesage = START_WITH_NO_CONTENT_DIR(currentDir);
    const error = console.error;

    let errorMessage = null;

    console.error = (x) => {
      errorMessage = x;
    };

    await main([arg]);

    console.error = error;
    assertEquals(errorMessage, `${ERROR_MESSAGE_TEMPLATE} ${expectedMesage}`);
  });
  test("should log an error if 'test' called in directory with no /practice dir", async () => {
    // Save the real console.error
    // to restore later
    const arg = "test";
    const currentDir = "/Users/jp/Dev/jp-courses";
    const expectedMesage = TEST_WITH_NO_PRACTICE_DIR(currentDir);
    const error = console.error;

    let errorMessage = null;

    console.error = (x) => {
      errorMessage = x;
    };

    await main([arg]);

    console.error = error;
    assertEquals(errorMessage, `${ERROR_MESSAGE_TEMPLATE} ${expectedMesage}`);
  });
});

// TODO throw logs at every step and figure out why we're missing the payment id in the integration tests

describe("downloadZipFromLink", () => {
  let tmpDirPath = "";
  let pathToZip = "";
  const expectedName = "course.zip";
  const prefix = `dowloadZipFromLink`;

  beforeEach(async () => {
    tmpDirPath = await Deno.makeTempDir({ prefix });
    console.log("tmpDirPath", tmpDirPath);
    pathToZip = `${tmpDirPath}/${expectedName}`;
  });
  afterEach(() => {
    // Clean up
    Deno.remove(tmpDirPath, { recursive: true });
  });
  test("should error if no downloadLink", async () => {
    let errorMessage = null;
    const error = console.error;

    console.error = (x) => {
      errorMessage = x;
    };
    const fakeVerifiedPurchase: VerifyPurchase = {
      paymentId: "cs_live_4321GHdfaJDK",
      verified: false,
      downloadLink: "",
      error: "Not verified",
    };

    await downloadZipFromLink(fakeVerifiedPurchase, "./tmpDir");
    const expectedMessage = MISSING_DOWNLOAD_LINK(
      fakeVerifiedPurchase.paymentId,
    );

    console.error = error;
    assertEquals(errorMessage, `${ERROR_MESSAGE_TEMPLATE} ${expectedMessage}`);
  });
  test("should error if dir doesn't exist", async () => {
    let errorMessage = null;
    const error = console.error;

    console.error = (x) => {
      errorMessage = x;
    };
    const fakeVerifiedPurchase: VerifyPurchase = {
      paymentId: "cs_live_4321GHdfaJDK",
      verified: true,
      downloadLink:
        "https://raw.githubusercontent.com/jsjoeio/install-scripts/main/fake-course.zip",
    };

    const dir = `./notExistantDir`;
    const expectedMessage = DIRECTORY_NOT_FOUND(
      dir,
    );
    await downloadZipFromLink(fakeVerifiedPurchase, dir);

    console.error = error;
    assertEquals(errorMessage, `${ERROR_MESSAGE_TEMPLATE} ${expectedMessage}`);
  });
  // TODO mock download request
  test("should download zip to path passed in", async () => {
    const fakeVerifiedPurchase: VerifyPurchase = {
      paymentId: "cs_live_4321GHdfaJDK",
      verified: true,
      downloadLink:
        "https://raw.githubusercontent.com/jsjoeio/install-scripts/main/fake-course.zip",
    };
    await downloadZipFromLink(fakeVerifiedPurchase, tmpDirPath);

    const zipExists = await exists(pathToZip);
    assertEquals(zipExists, true);
  });
});

describe("unZipCourse", () => {
  const error = console.error;
  let errorMessage = "";
  let tmpDirPath = "";
  let pathToUnzippedDir = "";
  let pathToZippedDir = "";
  const expectedName = "course";
  const prefix = `unZipCourse`;

  beforeEach(async () => {
    // Create a temporary directory
    tmpDirPath = await Deno.makeTempDir({ prefix });
    // Create a fake zip file
    const zip = new JSZip();
    zip.addFile("Hello.txt", "Hello World\n");

    pathToZippedDir = `${tmpDirPath}/${expectedName}.zip`;
    await zip.writeZip(pathToZippedDir);
    pathToUnzippedDir = `${tmpDirPath}/${expectedName}`;
    console.error = (x) => {
      errorMessage = x;
    };
  });

  afterEach(async () => {
    // Clean up
    const pathToZippedDirAsFile = await Deno.open(pathToZippedDir);
    const tmpDirPathAsFile = await Deno.open(tmpDirPath);
    const unzippedExists = await exists(pathToUnzippedDir);

    if (unzippedExists) {
      const pathToUnzippedDirAsFile = await Deno.open(pathToUnzippedDir);
      Deno.close(pathToUnzippedDirAsFile.rid);
      await Deno.remove(pathToUnzippedDir, { recursive: true });
    }

    Deno.close(pathToZippedDirAsFile.rid);
    Deno.close(tmpDirPathAsFile.rid);
    await Deno.remove(pathToZippedDir, { recursive: true });
    await Deno.remove(tmpDirPath, { recursive: true });
    // NOTE: not sure if the zip package I am using leaks
    // or if it's unzipping or something
    // but this closes all resources at the end of the test
    const { resources, close } = Deno;
    const openResources = resources();
    for (const key in openResources) {
      const resourceValue = openResources[key];
      const standardDenoResources = ["stdin", "stdout", "stderr"];
      if (!standardDenoResources.includes(resourceValue)) {
        close(parseInt(key));
      }
    }
    console.error = error;
  });

  test("test should have access to a temp dir and a zip file", async () => {
    const tempDirExists = await exists(tmpDirPath);
    assertEquals(tempDirExists, true);
    const zipExists = await exists(pathToZippedDir);
    assertEquals(zipExists, true);
  });

  test("should error if zip doesn't exist", async () => {
    const fileName = "myfakecourse.zip";
    const expectedMessage = FILE_NOT_FOUND(fileName);
    await unZipCourse("myfakecourse.zip");
    assertEquals(errorMessage, `${ERROR_MESSAGE_TEMPLATE} ${expectedMessage}`);
  });
  test("should unzip the file in the directory", async () => {
    await unZipCourse(pathToZippedDir, pathToUnzippedDir);

    // Check that it exists
    const unZippedExists = await exists(pathToUnzippedDir);
    assertEquals(unZippedExists, true);
  });
});

/*

Thoughts

This will be the function that runs when we call `jp-courses test`

It will:
2. it will then test all the exercises and all the quizzes
3. it will mark them complete if complete
4. if all exericses, quizzes are complete, it will mark sub-lesson complete
5. it will also walk up to the lesson and see if that should be marked complete as well
6. same with the module

*/
describe("verifyPracticeContent", () => {
  let tmpDirPath = "";
  let practiceDirPath = "";
  const prefix = `verifyPracticeContent`;
  let jsonFilePath = "";
  let exercisesFilePath = "";
  const course: CourseConfig = {
    name: "Basics of TypeScript",
    author: {
      name: "Joe Previte",
      twitter: "@jsjoeio",
      github: "@jsjoeio",
      website: "https://joeprevite.com",
    },
    modules: [
      {
        title: "How to Read TypeScript",
        number: 1,
        completed: false,
        lessons: [
          {
            title: "Annotations",
            number: 1,
            completed: false,
            sublessons: [
              {
                title: "Parameter Type Annotations",
                number: 1,
                completed: false,
                exercises: [
                  {
                    title: "Write Your Own",
                    number: 1,
                    skippable: false,
                    completed: false,
                    didSkip: undefined,
                    answerType: "subStringMatch",
                    answers: ["a: number, b: number"],
                  },
                  {
                    title: "In The Wild",
                    number: 2,
                    skippable: true,
                    completed: false,
                    didSkip: false,
                    answerType: "subStringMatch",
                    answers: [
                      "Link(2): https://github.com",
                      "Link(2): https://gitlab.com",
                    ],
                  },
                  {
                    title: "Meta",
                    number: 3,
                    skippable: true,
                    didSkip: false,
                    completed: false,
                    answerType: "subStringMatch",
                    answers: [
                      "Link(3): https://github.com",
                      "Link(3): https://gitlab.com",
                    ],
                  },
                ],
                quiz: [
                  {
                    title: "Do parameters always need to be annotated?",
                    number: 1,
                    skippable: false,
                    completed: false,
                    answers: ["yes"],
                  },
                  {
                    title:
                      "Type annotations are defined using what single character?",
                    number: 2,
                    skippable: false,
                    completed: false,
                    answers: [":", "colon"],
                  },
                  {
                    title:
                      "What is the type for the parameter used in the `helloWorld` example from the lesson?",
                    number: 3,
                    skippable: false,
                    completed: false,
                    answers: ["string"],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
  const log = console.log;
  const messages: string[] = [];

  beforeEach(async () => {
    tmpDirPath = await Deno.makeTempDir({ prefix });
    practiceDirPath = `${tmpDirPath}/practice`;
    await Deno.mkdir(practiceDirPath);
    jsonFilePath = `${tmpDirPath}/config.json`;
    exercisesFilePath = `${practiceDirPath}/exercises.md`;
    await Deno.writeTextFile(jsonFilePath, JSON.stringify(course));
    await Deno.writeTextFile(
      exercisesFilePath,
      `## Exercises

    ### 1 - Write Your Own

    Now it's your turn. Write a function called 'sum' which takes in two
    parameters, \`a\` and \`b\` both of which are type \`number\`. The function should
    return \`a + b\`.

    \`\`\`typescript
    function hi(a:number) {
      return \`Hello, \${name}! —World\`
    }
    \`\`\`

    ### 2 - In The Wild

    Time to see parameter type annotations out in the wild! Look on GitHub/GitLab
    for an OSS project that has an example of this and then paste the link below.

    Link(2):

    ### 3 - Meta

    Hopefully you're not scared of large codebases! Go to the [TypeScript
    repo](https://github.com/microsoft/TypeScript) and find an example of
    parameter type annotations and paste the link below.

    Link(3): https://github.com/typescript/cool-repo
    `,
    );

    console.log = (x) => {
      messages.push(x);
    };
  });

  afterEach(async () => {
    // Clean up
    const tmpDirPathAsFile = await Deno.open(tmpDirPath);
    const jsonFile = await Deno.open(jsonFilePath);
    const exerciseFile = await Deno.open(exercisesFilePath);
    Deno.close(jsonFile.rid);
    Deno.close(tmpDirPathAsFile.rid);
    Deno.close(exerciseFile.rid);
    await Deno.remove(tmpDirPath, { recursive: true });

    console.log = log;
  });

  test("should log a message about determining progress", async () => {
    await verifyPracticeContent(tmpDirPath);

    assertEquals(messages[0], "Determining course progress...");
  });

  test("should log a message with the course name, module, lesson and sublesson", async () => {
    await verifyPracticeContent(tmpDirPath);

    assertEquals(messages[1], "Course name: 'Basics of TypeScript'");
    assertEquals(messages[2], "Current Module: 'How to Read TypeScript'");
    assertEquals(messages[3], "Current Lesson: 'Annotations'");
    assertEquals(
      messages[4],
      "Current Sublesson: 'Parameter Type Annotations'",
    );
  });

  test("should log a message about checking the exercises", async () => {
    await verifyPracticeContent(tmpDirPath);

    assertEquals(
      messages[5],
      `Verifying Sublesson: Parameter Type Annotations`,
    );
  });

  test("should log a message with exercies results", async () => {
    await verifyPracticeContent(tmpDirPath);

    assertEquals(messages[6], `Exercise results:`);
    assertEquals(
      messages[7],
      `1. FAIL`,
    );
    assertEquals(messages[8], `2. SKIP`);
    assertEquals(messages[9], `3. PASS`);
    assertEquals(messages[10], `Completed: 2/3`);
  });
});
