import * as puppeteer from "puppeteer";

(async () => {
  // args
  const myArgs = process.argv.slice(2);
  const [projectFile, outputPath] = myArgs;

  // init puppeter
  const browserOpts = { headless: true, args: ["--no-sandbox"] };
  //const browserOpts = { devtools: true };
  const browser = await puppeteer.launch(browserOpts);
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

  const [el0] = await page.$x(
    `//label[contains(., 'Start project automatically')]`
  );
  await el0.click();

  const [el1] = await page.$x(`//label[contains(., 'Show green')]`);
  await el1.click();

  const [el2] = await page.$x(`//label[contains(., 'Show stop')]`);
  await el2.click();

  const [el3] = await page.$x(`//label[contains(., 'Support USB')]`);
  await el3.click();

  // submit
  console.log("Submitting");
  const [submit] = await page.$x("//button[contains(., 'Package')]");
  await submit.click();

  // debugger
  await page.screenshot({ path: "example.png" });
  console.log("Waiting for file");
  await page.waitForTimeout(1000);

  await browser.close();
})();
