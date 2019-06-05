import React from 'react';
import Axios from "axios"

import {Link} from 'react-router-dom';

class Info extends React.Component {
  constructor(props){
    super(props)


  }

  componentDidMount(){


  }
  componentWillReceiveProps(newProps){

  }

  render(){
    const displayRelatedExpressions = () => {
      if (this.props.info){
        const relatedExpressions = this.props.relatedExpressions.map((r) => {
          return <p key={r}><Link to={"/text?resourceid=" + r}>{r}</Link></p>
        })
        return relatedExpressions
      }
    }
    const displayManifestations = () => {
      if (this.props.info){
        const manifestations = this.props.info.manifestations.map((i) => {
          return <p key={i.manifestation}>{i.manifestationTitle} : <Link to={"/text?resourceid=" + i.manifestation}>{i.manifestation}</Link></p>
        })
        return manifestations
      }
    }
    const displayInfo = () => {
      if (this.props.info){
        return(
          <div>
          <p key="id">Resourceid: {this.props.info.resourceid.includes('http') ? this.props.info.resourceid : "http://scta.info/resource/" + this.props.info.resourceid}</p>
          <p key="inbox">LDN Inbox: {this.props.info.inbox}</p>
          </div>
        )
      }
    }
  return (

    <div className={this.props.hidden ? "hidden" : "showing"}>
      <h1>Info</h1>
      {displayInfo()}
      <div>
      <p>Manifestations</p>
      {displayManifestations()}
      </div>
      <div>
      <p>Related Expression</p>
      {displayRelatedExpressions()}
      </div>



    </div>
    );
  }
}

export default Info;