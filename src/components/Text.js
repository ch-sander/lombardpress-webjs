import React from 'react';

import $ from 'jquery';

import {loadXMLDoc, convertXMLDoc, scrollToParagraph} from './utils'

class Text extends React.Component {
  constructor(props){
    super(props)
    this.retrieveText = this.retrieveText.bind(this)


  }
  retrieveText(doc, topLevel, scrollTo){
    const _this = this;
    if (doc){
      //construct file url request ot exist db to get a cors enabled copy of the text (github does not serve files with cors enabled)
      const doc = this.props.doc;
      const topLevel = this.props.topLevel;
      const docFragment = doc.split("/master/")[1]
      const topLevelFragment = topLevel.split("/resource/")[1]

      let xmlurl = ""
      if (doc.includes("ipfs")){
        xmlurl = doc
      }
      else{
        xmlurl = "http://exist.scta.info/exist/apps/scta-app/text/" + topLevelFragment + "/" + docFragment;
      }
      const xslurl = "/xslt/main_view.xsl"
      const resultDocument = convertXMLDoc(xmlurl, xslurl)
      // append resultDoc to div in DOM
      document.getElementById("text").innerHTML = "";
      document.getElementById("text").appendChild(resultDocument);
      // if (this.state.blockFocus){
      //   scrollToParagraph(this.state.blockFocus, true)
      // }
    }
    // bind events to dom
    // only seems to be working when they are here; not yet sure why

    $('.lbp-paragraphmenu').click(function(e) {
         e.preventDefault();
         const id = $(this).attr('data-id')
         _this.props.setFocus(id)
         _this.props.openWindow("window1", "info")
    });

    // scroll to paragraph after document has been appended
    scrollToParagraph(scrollTo, true)

  //   $('.lbp-paragraphmenu').click(function(e) {
  //     e.preventDefault();
  //     const id = $(this).attr('data-id')
  //
  //     //_this.setState({blockFocus: id})
  //     _this.setState((prevState) => {
  //       const windows = prevState.windows
  //       windows.window1.open = true
  //       return {
  //         windows: windows,
  //         blockFocus: id
  //       }
  //
  //     })
  //     // set block info to state.info
  //     const fullid = "http://scta.info/resource/" + id
  //     const info = runQuery(basicInfoQuery(fullid))
  //     _this.arrangeTextInfo(info, fullid)
  //
  //     // retrieve relatedExpressions info
  //     // get related expressions info
  //     // TODO/Note this is getting called in handleBlockFocusChange as well;
  //     // Strong candidate for  refactor
  //     const relatedExpressions = runQuery(getRelatedExpressions(fullid))
  //     _this.arrangeRelatedInfo(relatedExpressions)
  //     // scroll to paragraph
  //     scrollToParagraph(id, true)
  //
  //   });
    $('.js-show-folio-image').click(function(e) {
      e.preventDefault();
      const id = $(this).attr('data-surfaceid')
      //_this.setState({surfaceFocus: "http://scta.info/resource/" + id})
      // _this.setState((prevState) => {
      //   const windows = prevState.windows
      //   windows.window2.open = true
      //   windows.window2.windowLoad = "surface2"
      //   return {
      //     windows: windows,
      //     surfaceFocus: "http://scta.info/resource/" + id
      //   }

        _this.props.handleSurfaceFocusChange("http://scta.info/resource/" + id)
        _this.props.openWindow("window2", "surface2")
    });
  }

  componentDidUpdate(prevProps, prevState){

    //check to see if doc has changed
    if (prevProps.doc != this.props.doc){
      this.retrieveText(this.props.doc, this.props.topLevel, this.props.scrollTo)
    }
    // if doc has already been appended, still scroll to target block
    else{
      scrollToParagraph(this.props.scrollTo, true)
    }


    //this.retrieveText(this.props.doc, this.props.topLevel, this.props.scrollTo)
  }

  componentDidMount(){
    this.retrieveText(this.props.doc, this.props.topLevel, this.props.scrollTo)
  }
  componentWillReceiveProps(newProps){

  }
  render(){

    return (
      <div>
        <div id="text"></div>
      </div>
    );
  }
}

export default Text;
