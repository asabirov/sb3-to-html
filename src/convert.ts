import * as puppeteer from "puppeteer";

(async () => {
  // args
  const myArgs = process.argv.slice(2);
  const [projectFile, outputPath] = myArgs;

  // init puppeter
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.client().send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: outputPath,
  });

  // open turbowarp
  await page.goto(`file://${__dirname}/../turbowarp/turbowarp.html`);

  // wait
  await page.waitForSelector("[value=file]");

  // select file radio
  const radio = await page.$("[value=file]");
  await radio.click();

  // upload sb3
  console.log("Uploading", projectFile);
  const file = await page.$("[type=file]");
  await file.uploadFile(projectFile);

  // next step
  const button = await page.$("button");
  await button.click();

  // wait
  console.log("Waiting for next step");
  await page.waitForSelector("button.danger");

  // enable controls

  const options = [
    "Show green",
    "Show stop",
    "Show fullscreen button",
    "Support USB",
  ];

  await Promise.all(
    options.map(async (label) => {
      console.log("Clicking ", label);
      const [element] = await page.$x(`//*[contains(., '${label}')]`);
      await element.click();
    })
  );

  // submit
  console.log("Submitting");
  const [submit] = await page.$x("//button[contains(., 'Package')]");
  await submit.click();

  // debugger
  // await page.screenshot({ path: "example.png" });
  console.log("Waiting for file");
  await page.waitForTimeout(1000);

  await browser.close();
})();
