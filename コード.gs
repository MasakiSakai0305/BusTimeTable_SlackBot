function getBusTime(destination){
  //時刻表のURL1
  let url = 'バスの時刻表のURL';
  //時刻表のURL2
  let url2 = 'バスの時刻表のURL';
  
  let htmlText;
  
  //使う路線によって場合わけ
  if (destination == '目的地1'){
    htmlText = scraping(url);
  } else if (destination == '目的地2'){
    htmlText = scraping(url2);
  }
  
  //現在の時刻
  var nowTime = getTime();
  
  //現在の時刻(hour:時間)
  let nowHour = nowTime.split(':')[0];
  
  //時間ごとにパースして配列に格納
  var hoursArray = Parser.data(htmlText).from('<th class="hour">').to('</tr>').iterate();
  
  //それぞれ現在,現在+1, 現在-1の時刻表のHTMLテキスト
  var nowTimeData = hoursArray[nowHour - 5];
  var nowPlusOne = hoursArray[nowHour - 4];
  var nowMinusOne = hoursArray[nowHour - 6];
  
      
      //曜日によってスイッチ
      switch (getDay()) {
      case "wkd":
        let arrWkd = parseHtml("wkd", nowTimeData);
        let arrWkdPlus = parseHtml("wkd", nowPlusOne);
        let arrWkdMinus = parseHtml("wkd", nowMinusOne);
        
        let payload = {"バスの時刻表": arrWkd + '\n' ,"現在時刻" : nowTime + '\n', "バスの時刻表+1時間": arrWkdPlus + '\n', "バスの時刻表-1時間": arrWkdMinus + '\n'};
        return payload
        
      case "std":
        let arrStd = parseHtml("std", nowTimeData);
        let arrStdPlus = parseHtml("std", nowPlusOne);
        let arrStdMinus = parseHtml("std", nowMinusOne);
        
        let payload2 = {"バスの時刻表": arrStd + '\n' ,"現在時刻" : nowTime + '\n', "バスの時刻表+1時間": arrStdPlus + '\n', "バスの時刻表-1時間": arrStdMinus + '\n'};
        return payload
        
      case "snd":
        let arrSnd = parseHtml("snd", nowTimeData);
        let arrSndPlus = parseHtml("snd", nowPlusOne);
        let arrSndMinus = parseHtml("snd", nowMinusOne);
        
        let payload3 = {"バスの時刻表": arrSnd + '\n' ,"現在時刻" : nowTime + '\n', "バスの時刻表+1時間": arrSndPlus + '\n', "バスの時刻表-1時間": arrSndMinus + '\n'};
        return payload
      default:
        return "Error"
    }
  
}


//URLからHTMLテキストをスクレイピングする関数
function scraping(url){
  var response = UrlFetchApp.fetch(url).getContentText();
  return response
}

//HTMLをパースして1時間分の時刻を取得
function parseHtml(dayString, hourData){
    var busTimeString = ""
    
    //その日の曜日の時刻を取得
    var dayTime = Parser.data(hourData).from(`<td class=${dayString}>`).to('</td>').iterate();
    
    //現在の時間の時刻を取得(ex,現在が12時代ならば, 12時代のバスの時刻を全て取得)
    var nowBusTimeArray = Parser.data(dayTime[0]).from('<div class="mm">').to('</div>').iterate();
    
    for(var i=0;i<nowBusTimeArray.length;i++){
      var time = Parser.data(nowBusTimeArray[i]).from('>').to('</a>').build();
      busTimeString += String(parseInt(time, 10)) + ', ';
      }
    return busTimeString
}

//今日の曜日取得
function getDay(){
  var now = new Date()
  day = now.getDay()

  
  if (day >= 1.0 && day <= 5.0){
    return 'wkd'
  } else if (day == 6.0){
    return 'std'
  } else{
    return 'snd'
  }
}

//現在の時間を取得
function getTime(){

  var date = new Date();
  
  var hour = date.getHours();
  var min = date.getMinutes();

  var nowTime = `${hour}:${min}` 

  return nowTime
}


function doPost(e) {
  //slack appアクセストークン
  var token = PropertiesService.getScriptProperties().getProperty('SlackAccessToken');
  //outGoingWebhookトークン
  var verifyToken = PropertiesService.getScriptProperties().getProperty('OutgoingWebhookToken');
  
  //PostするチャンネルのchannnelID
  let channelId = PropertiesService.getScriptProperties().getProperty('channelID');
  
  var text = e.parameter.text;
  
  //メッセージ
  var message;
  

  if (text.match(/目的地1/)) {
    message = getBusTime('目的地1');
  } else if (text.match(/目的地2/)) {
    message = getBusTime('目的地2');
  } else {
    message = 'error'
  }
 
  Logger.log(verifyToken);
  if (verifyToken != e.parameter.token) {
    throw new Error("invalid token.!!!!", verifyToken);
  }
  

  let option = {
    "icon_url":"https://5931bus.com/files/user/img/smp/mainimage_charter.png"
  }


  var slackApp = SlackApp.create(token); 
  slackApp.postMessage(channelId, message, option);
 
}
