import Axios from 'axios'
import {sparqlEndpoint} from './config';
import $ from 'jquery';


export function loadXMLDoc(url){
  //See https://github.com/martin-honnen/martin-honnen.github.io/blob/master/xslt/arcor-archive/2016/test2016081501.html
  return new Promise(function(resolve) {
    var req = new XMLHttpRequest();
    req.open("GET", url);
    if (typeof XSLTProcessor === 'undefined') {
     try {
       req.responseType = 'msxml-document';
     }
     catch (e) {
       console.log('error', e)
     }
    }
    req.onload = function() {
     resolve(this.responseXML)
    }
    req.send();
  });
}

export function convertXMLDoc(xmlurl, xslurl){
  //See https://github.com/martin-honnen/martin-honnen.github.io/blob/master/xslt/arcor-archive/2016/test2016081501.html
  return new Promise(function(resolve, reject){
    Promise.all([loadXMLDoc(xmlurl), loadXMLDoc(xslurl)]).then(function(data) {
      const xsltProcessor = new XSLTProcessor();
      xsltProcessor.importStylesheet(data[1]);
      if (data[0]){
        const resultDocument = xsltProcessor.transformToFragment(data[0], document);
        resolve(resultDocument)
      }
      else{
        const reason = new Error('xml document could not be retrieved');
        reject(reason); // reject
      }
    })
  })
}

export function loadHtmlResultDocFromExist(url){
  return Axios.get("https://exist.scta.info/exist/apps/scta-app/xslt-conversion.xq?xmlurl=" + url)
}

export function nsResolver(prefix) {
    if(prefix === "tei") {
      return 'http://www.tei-c.org/ns/1.0'
    }
}

export function copyToClipboard(string){
  var dummy = document.createElement("textarea");
  document.body.appendChild(dummy);
  dummy.value = string;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
}

export function runQuery(query){
  //const sparqlEndpoint = "https://sparql-docker.scta.info/ds/query"
  //const sparqlEndpoint = sparqlEndpoint
  const queryPromise = Axios.get(sparqlEndpoint, { params: { "query": query, "output": "json" } })
  return queryPromise
}

//handles scroll to paragraph procedure
export function scrollToParagraph(hash, highlight){
    const element = $("#" + hash);

    // TODO: refactor. this could be a lot simpler
    if (highlight){
      element.addClass("highlightNone");
      $(".paragraphnumber").removeClass("highlight2")
      $(".plaoulparagraph").removeClass("highlightNone")
      $(".lbp-quote").removeClass("highlightNone")
      $(".lbp-quote").removeClass("highlight")
      $(".lbp-ref").removeClass("highlightNone")
      $(".lbp-ref").removeClass("highlight")
      $(".plaoulparagraph").removeClass("highlight")
      element.children(".paragraphnumber").addClass("highlight2")
      element.addClass( "highlight");
      
      // TODO: Refactor
      // conditional to ensure fire of next conditional ONLY IF element[0] is found
      // prevents error with include method below when element does not exist
      if (element[0]){
        // condition set to prevent fade if element is quote or ref 
        if (!element[0].className.includes('lbp-quote') && !element[0].className.includes('lbp-ref')){
          setTimeout(function(){
            $(".lbp-ref").removeClass("highlight")
            $(".lbp-quote").removeClass("highlight")
            $(".plaoulparagraph").removeClass("highlight")
            element.addClass("highlightNone");
          }, 2000);
        }
      }

    }
  	if (element.length > 0) {
  	    $('html, body')
              .stop()
              .animate({
                  scrollTop: element.offset().top - 100
              }, 1000);
     }

  }

  // adopted from https://github.com/hypothesis/client/blob/master/src/annotator/anchoring/text-position.js
  /**
 * Convert `start` and `end` character offset positions within the `textContent`
 * of a `root` element into a `Range`.
 *
 * Throws if the `start` or `end` offsets are outside of the range `[0,
 * root.textContent.length]`.
 *
 * @param {HTMLElement} root
 * @param {number} start - Character offset within `root.textContent`
 * @param {number} end - Character offset within `root.textContent`
 * @return {Range} Range spanning text from `start` to `end`
 */

function nodeFilterCheck(node){
  
  const check = node.parentElement.className
  // skip text nodes if their parent has the following classes
  if (check.includes("paragraphnumber") 
  || check.includes("lbp-line-number")
  || check.includes("appnote") 
  || check.includes("paragraphnumber")
  || check.includes("footnote")
  || check.includes("lbp-reg")
  || check.includes("lbp-folionumber")
  || check.includes("js-show-folio-image") // removes folio number
  ){
    return NodeFilter.FILTER_REJECT
  }
  else if (!node.nodeValue){
    return NodeFilter.FILTER_REJECT
  }
  else{
    return NodeFilter.FILTER_ACCEPT;
  }
  
}

export function toRange(root, start, end) {
  // The `filter` and `expandEntityReferences` arguments are mandatory in IE
  // although optional according to the spec.
  //console.log("root", root)
  const nodeIter = root.ownerDocument.createNodeIterator(
    root,
    NodeFilter.SHOW_TEXT,
    nodeFilterCheck, // filter
    true // expandEntityReferences
  );

  let startContainer;
  let startOffset;
  let startWordOffset
  let endContainer;
  let endOffset;
  let endWordOffset;
  let breaks = 0;

 // let textLength = 0;
  let wordLength = 0;
  let node;

  
  while ((node = nodeIter.nextNode()) && (!startContainer || !endContainer)) {
    // keep running total of break words and then use this to adjust word count 
    // in comparison to word count with broken words; then adjust;
    // NOTE: requires xslt to add data-break='no' to line break span
    if (node.previousSibling){
      if (node.previousSibling.getAttribute){
        if (node.previousSibling && node.previousSibling.getAttribute("data-break") === "no"){
          breaks += 1
        }
      }
    }
    const nodeText = node.nodeValue;
    let newWordLength = 0
    // use clean text to remove punctuation and unwanted white space, then filter to get rid of blank array items, then count
      newWordLength = cleanText(nodeText).split(" ").filter(n=>n).length;
    // if start word is greater than length of wordcount in preceding nodes, but less than or equal 
    // to word count of of preceding plus this node, then selection starts somewhere within this node
    // select node, then find precise word and character position start
    if (
      !startContainer &&
      start + breaks >= wordLength &&
      start + breaks <= wordLength + newWordLength
    ) {
      startContainer = node;
      startWordOffset = start + breaks - wordLength;
      startOffset = node.nodeValue.split(cleanText(nodeText).split(" ").filter(n=>n)[startWordOffset - 1])[0].length
    }
    // similar to above only for final position
    if (
      !endContainer &&
      end + breaks >= wordLength &&
      end + breaks <= wordLength + newWordLength
    ) {
      endContainer = node;
      endWordOffset = end + breaks - wordLength;
      endOffset = node.nodeValue.split(cleanText(nodeText).split(" ").filter(n=>n)[endWordOffset])[0].length
    }

    //textLength += nodeText.length;
    wordLength += newWordLength
    
  }

  if (!startContainer) {
    throw new Error('invalid start offset');
  }
  if (!endContainer) {
    throw new Error('invalid end offset');
  }

  const range = root.ownerDocument.createRange();
  range.setStart(startContainer, startOffset);
  range.setEnd(endContainer, endOffset);

  return range;
}

// function to remove spaces from selected html text
export function cleanText(selectedText){
  selectedText = selectedText.replace(/^[ ]+|[ ]+$/g,''); // remove leading and trailing white space
  selectedText = selectedText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"]/g,"") //remove all punctuation
  selectedText = selectedText.replace(/\s+/gi, ' ' ) // condences 1 or more space to single space
  return selectedText
}