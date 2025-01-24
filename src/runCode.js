const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { spawnSync } = require('child_process');
const fs = require('fs');
const vscode = require('vscode');

function compareOutputs(stdout, titleSlug, case_no, casePath){
  const expectedOpFile = `${casePath}${outfileName}${case_no}.txt`
  let expextedOp = fs.readFileSync(expectedOpFile, { encoding: 'utf8', flag: 'r' });
  expextedOp = expextedOp.trim()
  stdout = stdout.trim();
  outputChannel.appendLine(`Expected Output: ${expextedOp}`);
  outputChannel.appendLine(`Recieved Output: ${stdout}`);
  if(stdout == expextedOp){
    outputChannel.appendLine(`TestCase: ${case_no} Passed!`);
    return true;
  }
  else{
    outputChannel.appendLine(`TestCase: ${case_no} Failed!`);
    return false;
  }
}

async function runPyCase(titleSlug, case_no, pass_obj, casePath, codePath, src_root_path) {
  outputChannel.appendLine(`Running TestCase ${case_no}: `);
  try {
    if(fs.existsSync(`${casePath}${inputName}${case_no}.txt`)){
      let case_input = fs.readFileSync(`${casePath}${inputName}${case_no}.txt`, { encoding: 'utf8', flag: 'r' });
      case_input = case_input.trim();
      outputChannel.appendLine(`Input: ${case_input}`);
      const pythonProcess = await spawnSync('python3', [
        `${src_root_path}\\myPyRunner.py`,
        'first_function',
        `${codePath}${titleSlug}.py`,
        `${casePath}${inputName}${case_no}.txt`
      ]);
      // outputChannel.appendLine(`${src_root_path}src\\myPyRunner.py`);
      const stdout = pythonProcess.stdout?.toString()?.trim();
      pass_obj.passed = pass_obj.passed & compareOutputs(stdout, titleSlug, case_no, casePath);
      return pass_obj.passed;
    }
    else{
      outputChannel.appendLine(`Input file NOT FOUND for the TestCase: ${case_no}`)
      pass_obj.passed = false;
    }
    // outputChannel.appendLine(`Testcase ${case_no}: ${pass_obj.passed}`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error in Running Test Case: ${case_no}:`, error);
    console.error(`Error in Running Test Case: ${case_no}:`, error);
    pass_obj.passed = false;
    return false;
  }
}

async function runCase(titleSlug, case_no, pass_obj, casePath, codePath) {
  outputChannel.appendLine(`Running TestCase ${case_no}: `);
  try {
    if(fs.existsSync(`${casePath}${inputName}${case_no}.txt`)){
      let case_input = fs.readFileSync(`${casePath}${inputName}${case_no}.txt`, { encoding: 'utf8', flag: 'r' });
      case_input = case_input.trim();
      outputChannel.appendLine(`Input: ${case_input}`);
      const { stdout } = await exec(`${codePath}${titleSlug}.exe < ${casePath}${inputName}${case_no}.txt`);
      pass_obj.passed = pass_obj.passed & compareOutputs(stdout, titleSlug, case_no, casePath);
      return pass_obj.passed;
    }
    else{
      outputChannel.appendLine(`Input file NOT FOUND for the TestCase: ${case_no}`)
      pass_obj.passed = false;
    }
    // outputChannel.appendLine(`Testcase ${case_no}: ${pass_obj.passed}`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error in Running Test Case: ${case_no}:`, error);
    console.error(`Error in Running Test Case: ${case_no}:`, error);
    pass_obj.passed = false;
    return false;
  }
}

async function getTotalCases(casePath){
  let totalCases = 0;
  while(fs.existsSync(`${casePath}${inputName}${totalCases+1}.txt`)){
    totalCases ++;
  }
  outputChannel.appendLine(`Total TestCases found: ${totalCases}`);
  return totalCases;
}

async function runAllCases(language, titleSlug, casePath, codePath, src_root_path) {
  const totalCases = await getTotalCases(casePath);
  let wrongCase = -1;
  let case_no;
  outputChannel.appendLine(`Running TestCases...\n`);
  let pass_obj = { passed: true };
  for (case_no = 1; case_no <= totalCases; case_no++) {
    if(language == "py"){
      await runPyCase(titleSlug, case_no, pass_obj, casePath, codePath, src_root_path);
    }
    else{
      await runCase(titleSlug, case_no, pass_obj, casePath, codePath);
    }
    outputChannel.appendLine(``);
    if(!pass_obj.passed){
      if(wrongCase < 0)
        wrongCase = case_no;
      // break;
    }
  }
  if(pass_obj.passed){
    vscode.window.showInformationMessage("All TestCases Passed!");
    outputChannel.appendLine("All TestCases Passed!");
  }
  else{
    vscode.window.showErrorMessage(`Wrong answer on TestCase: ${wrongCase}`);
    outputChannel.appendLine(`Wrong answer on TestCase: ${wrongCase}`);
  }
}

function getLanguage(sourceCode) {
  const matchExt = sourceCode.match(/\.(\w+)$/);
  const matchName = sourceCode.match(/^(.*)\.[^\.]+$/);
  const retName = matchName ? matchName[1] : sourceCode;
  const retExt = matchExt ? matchExt[1] : null;
  return [ retName, retExt ]; 
}

async function mainFunc(titleSlug, activeFileDirPath, language, src_root_path){
  const casePath = activeFileDirPath + `${caseDirName}\\${titleSlug}\\`;
  const codePath = activeFileDirPath;
  outputChannel = await vscode.window.createOutputChannel(`${titleSlug}.${language}`);
  outputChannel.show();
  
  if(language == "py"){
    runAllCases(language, titleSlug, casePath, codePath, src_root_path);   
  }
  else{
    let compileCode = new Promise((resolve)=>{
      if(language == "cpp" ){
      exec(`g++ -std=c++17 -o ${codePath}${titleSlug} ${codePath}${titleSlug}.cpp`);
    }
    if(language == "c" ){
      exec(`gcc -o ${codePath}${titleSlug} ${codePath}${titleSlug}.c`);
    }
    setTimeout(()=>{
      outputChannel.appendLine(`Source Code file compiled.`)
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
      else if (fs.existsSync(`${codePath}${titleSlug}.exe`)){
        resolve(56);
        clearInterval(searchInterval);
        // outputChannel.appendLine(`Code Executable Found!`);
      }
    }, 10);
  })
    await compileCode;
    let search_completed = await searchExecutable;
    if(search_completed == 56){
      setTimeout(()=>{      
  
        runAllCases(language, titleSlug, casePath, codePath);   
  
        }, 10);
    }
    else{
      outputChannel.appendLine(`Executable File Not Found!`);
    }
  }
}

const caseDirName =  `cases`
const inputName = `input_`;
const outfileName = `output_`;
let searchCounter = 400;
let searchInterval;
let outputChannel;


module.exports = { mainFunc, getLanguage };