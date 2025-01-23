import * as fs from 'fs';
import jsdom from "jsdom";


function storeCase(file_name, case_content){
  if (!fs.existsSync(casePath)) 
    fs.mkdirSync(casePath, { recursive: true });
  
  // console.log(`Directory '${directoryPath}' created.`);
  
  const file_path = casePath + `/` + file_name + `.txt`;
  fs.writeFile(file_path, case_content, 'utf8', (error) => {
    if (error) {
      console.error(`An error occurred while writing to the file: ${file_path}`, error);
      return;
    }
    console.log(`File '${file_path}' has been written successfully.`);
  });
}

function parseSampleCase(inputString, extract_type) {
  /* extract_type: 1 if Input
  2 if Output     */
  let result = '\n';
  if (extract_type == 1) {
    let inputMatch = inputString.match(/Input:\s*(.*?)\n/);
      if (!inputMatch) {
        inputMatch = inputString.match(/Input\s*(.*?)\n/);
      }
      result = inputMatch[1].trim() + `\n`;
    } else if(extract_type == 2) {
      let outputMatch = inputString.match(/Output:\s*(.*?)\n/);
      if (!outputMatch) {
        outputMatch = inputString.match(/Output\s*(.*?)\n/);
      }
      result = outputMatch[1].trim() + `\n`;
    }
    else{
      console.log(`Invalid extraction type!`);
    }
    return result;  
  }
  
function parse(html){
    const dom = new jsdom.JSDOM(html);
    let sample_cases = dom.window.document.querySelectorAll(`pre`); // 'Hello world'
    for (let i = 0; i < sample_cases.length; i++) {
      const sample_case = sample_cases[i].textContent;
      // console.log("Input \n");
      // console.log(parseSampleCase(sample_case, 1));
      // console.log("Output \n");
      // console.log(parseSampleCase(sample_case, 2));
      let input_name = `input_${i+1}`;
      let output_name = `output_${i+1}`;
      storeCase(input_name, parseSampleCase(sample_case, 1));
      storeCase(output_name, parseSampleCase(sample_case, 2));
      
      //   task.addTest(parseSampleCase(sample_case, true), parseSampleCase(sample_case, false));
      
      // console.log(sample_cases[i].textContent);
    }
    
    // return task.build();
  }
  
export function extractTitleSlug(ques_url){
    const regex = /https:\/\/leetcode\.com\/problems\/([^\/]*)/;
    const match = ques_url.match(regex);
    return match ? match[1] : null;
  }
  
export function fetchAndStore(ques_url){
    // const api_url = `https://alfa-leetcode-api.onrender.com/select?titleSlug=` + extractTitleSlug(ques_url);
    const api_url = `http://localhost:3031/select?titleSlug=` + extractTitleSlug(ques_url);
    let p = fetch(api_url);
    p.then((value1)=>{
      console.log(value1.status)
      console.log(value1.ok)
      return value1.json()
    }).then((data)=>{
      
      const ques_title = data["titleSlug"]
      
      const html = data["question"];
      // console.log(html);
      casePath = casePath + `/${ques_title}`;
      
      let parsingDone = new Promise((resolve, reject) =>{
        parse(html);
        resolve(56);
      })
      
      parsingDone.then((value)=>{
        console.log(`Problem Parsed!`);
      }, (error)=>{
        console.log(`Unable to parse the problem! ${error}`);
      })
      
      
    })
  }
  let casePath =  `./cases`