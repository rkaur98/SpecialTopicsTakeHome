
'use strict';
let AWS = require('aws-sdk'),
    s3 = new AWS.S3(),
    documentClient = new AWS.DynamoDB.DocumentClient(); 
let musicarray =[];

// Generates data for GET API endpoint of ALL SONGS =====================================

module.exports.filestrack = (event, context, callback) => {
  
  let params = {
    TableName : "dropbox-file-table1"
  };
  
  documentClient.scan(params, function(err, data){
    if (err) callback(err, null);
    else callback(null, data);
    
  });

};

// POST data to playlist table by passing filename to event ================================

module.exports.postplaylist = (event, context, callback) => {

  let params = {
    TableName : "dropbox-file-table1"
  };
  
  documentClient.scan(params, function(err, data){
    
    for(let i = 0; i < data.Items.length; i++){
      if(data.Items[i].eventname == "ObjectCreated"){
        musicarray.push(data.Items[i].fileName);
      }
      
    }
    
  });
  
  if(musicarray.indexOf(event.fileName) > -1){
    let params = {
      TableName : "playlist-file-table1",
      Item : {
        "fileName" : event.fileName
      }
      
    };
    documentClient.put(params, function(err, data){
      // If event filename exist in all songs list, playlist table is updated with that song
      callback(err, "playlist updated");
    });
  }
  else{
    // If event filename does not exist in all songs list
    callback("Either song does not exist or removed from songs list");
  }
  

};

// Generates data for GET API endpoint of PLAYLIST SONGS ====================================

module.exports.getplaylist = (event, context, callback) => {
  
  let params = {
    TableName : "playlist-file-table1"
  };
  
  documentClient.scan(params, function(err, data){
    if (err) callback(err, null);
    else callback(null, data);
    
  });

};

// Updates DynamoDB table when any file is uploaded to S3 ====================================

module.exports.postprocess = (event) => {
  event.Records.forEach((record) => {
    const filename = record.s3.object.key;
    const filesize = record.s3.object.size;
    const eventtime = record.eventTime;
    const eventname = record.eventName;
    const date = eventtime.substr(0, 10);
    const time = eventtime.substr(11,8);
    const event = eventname.split(":");

    
    const params = {
      TableName: 'dropbox-file-table1',
      Item: {
        "fileName" : filename,
        "filesize": filesize,
        "eventtime": time,
        "Date": date,
        "eventname": event[0]
      }
    }

    documentClient.put(params, (err, data) => {
      
      console.log("data updated")
    })

  });
};
