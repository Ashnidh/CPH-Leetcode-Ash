const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const { resolve } = require('path');

// async function compileCode(titleSlug){
//   exec(`g++ -std=c++17 -o ${dirPath}${titleSlug} ${dirPath}${titleSlug}.cpp`);
//   setTimeout(()=>{

//   })
// }

function compareOutputs(stdout, titleSlug, case_no){
  const expectedOpFile = `${casePath}${outfileName}${case_no}.txt`
  let expextedOp = fs.readFileSync(expectedOpFile, { encoding: 'utf8', flag: 'r' });
  expextedOp = expextedOp.trim()
  stdout = stdout.trim();
  console.log(`Expected Output: ${expextedOp}`);
  console.log(`Recieved Output: ${stdout}`);
  if(stdout == expextedOp){
    console.log(`TestCase: ${case_no} Passed!`);
    return true;
  }
  else{
    console.log(`TestCase: ${case_no} Failed!`);
    return false;
  }
}

async function runCase(titleSlug, case_no, pass_obj) {
  console.log(`Running TestCase ${case_no}: `);
  try {
    if(fs.existsSync(`${casePath}${inputName}${case_no}.txt`)){
      let case_input = fs.readFileSync(`${casePath}${inputName}${case_no}.txt`, { encoding: 'utf8', flag: 'r' });
      case_input = case_input.trim();
      console.log(`Input: ${case_input}`);
      const { stdout } = await exec(`${dirPath}${titleSlug}.exe < ${casePath}${inputName}${case_no}.txt`);
      pass_obj.passed = pass_obj.passed & compareOutputs(stdout, titleSlug, case_no);
      return pass_obj.passed;
    }
    else{
      console.log(`Input file NOT FOUND for the TestCase: ${case_no}`)
      pass_obj.passed = false;
    }
    // console.log(`Testcase ${case_no}: ${pass_obj.passed}`);
  } catch (error) {
    console.error(`Error in Running Test Case: ${case_no}:`, error);
    pass_obj.passed = false;
    return false;
  }
}

async function getTotalCases(titleSlug){
  let totalCases = 0;
  while(fs.existsSync(`${casePath}${inputName}${totalCases+1}.txt`)){
    totalCases ++;
  }
  console.log(`Total TestCases found: ${totalCases}`);
  return totalCases;
}

async function runAllCases(titleSlug) {
  const totalCases = await getTotalCases(titleSlug);
  let wrongCase = -1;
  let case_no;
  console.log(`Running TestCases...\n`);
  let pass_obj = { passed: true };
  for (case_no = 1; case_no <= totalCases; case_no++) {
    await runCase(titleSlug, case_no, pass_obj);
    console.log(``);
    if(!pass_obj.passed){
      if(wrongCase < 0)
        wrongCase = case_no;
      // break;
    }
  }
  if(pass_obj.passed){
    console.log("All TestCases Passed!");
  }
  else{
    console.log(`Wrong answer on TestCase: ${wrongCase}`);
  }
}

async function mainFunc(){
  let compileCode = new Promise((resolve, reject)=>{
    exec(`g++ -std=c++17 -o ${dirPath}${titleSlug} ${dirPath}${titleSlug}.cpp`);
    setTimeout(()=>{
      console.log(`Source Code file compiled.`)
      resolve(56);
    }, 10)
  });
  let searchExecutable = new Promise((resolve, reject)=>{
    searchInterval = setInterval(()=>{
      searchCounter = searchCounter - 1;
      if(searchCounter < 0){
        clearInterval(searchInterval);
        reject(-1);
      }
      else if (fs.existsSync(`${dirPath}${titleSlug}.exe`)){
        resolve(56);
        clearInterval(searchInterval);
        // console.log(`Code Executable Found!`);
      }
    }, 10);
  })

  await compileCode;
  let search_completed = await searchExecutable;
  if(search_completed == 56){
    setTimeout(()=>{      

      runAllCases(titleSlug);   

      }, 10);
  }
  else{
    console.log(`Executable File Not Found!`);
  }
}

const titleSlug = `reverse-integer`;

let mainDirName =  `mainDir`;

const dirPath = `.\\my_pro\\code\\`;
const casePath = `.\\my_pro\\${mainDirName}\\${titleSlug}\\`;
// const case_no = 3;
const inputName = `input_`;
const outfileName = `output_`;

let searchCounter = 400;
let searchInterval;

mainFunc();