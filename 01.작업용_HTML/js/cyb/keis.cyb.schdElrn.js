var _FRM_SEARCH;
var _URL_LIST;
var _URL_DETAIL;
var _URL_APP_REGT;
var _URL_POPUP;
var _URL_ID_CHK_POPUP;
var _URL_ID_CHK;
var _URL_PRECED;
var _URL_REGT_SAVE;
var _URL_INTRST;
var _URL_CNE_REGT;
var _URL_MYPAGE;
var _URL_AJAX_LIST;

//과정검색 검색
function fnSearch(){

	/*var searchCrsClfcCd = [];
	var i = 0;
	$("input[name='searchCrsClfcCd']:checked").each(function(){
		searchCrsClfcCd[i] = $(this).val();
		i++;
	});

	$("#crsClfcCdParam").val(searchCrsClfcCd);*/
	$("#crsClfcCdParam").val();
	_FRM_SEARCH.target = "_self";
	_FRM_SEARCH.action = _URL_LIST;
	_FRM_SEARCH.submit();
}

//과정 상세보기
function fnDetail(crsId, crsSeqId){
	$("#crsId").val(crsId);
	$("#crsSeqId").val(crsSeqId);
	_FRM_SEARCH.target = "_self";
	_FRM_SEARCH.action = _URL_DETAIL;
	_FRM_SEARCH.submit();
}

//관심과정등록
function fnCrsBookMark(crsId){

	var param = {'crsId' : crsId};

	if(confirm('관심과정으로 등록하시겠습니까?')){
		//선행과정 이수 확인
		jQuery.ajax({
			type : 'post',
			url : _URL_INTRST,
			dataType : 'text',
			data : param,
			async : false,
			success : function(data) {
				if(data == "Y"){
					alert('관심과정으로 등록 되었습니다.');
				}else if(data == "N"){
					alert('등록에 실패 하였습니다.');
				}else if(data == "L"){
					alert('로그인 후 이용하실 수 있습니다.');
					location.href = _URL_LOGIN;
					return false;
				}else if(data == "D"){
					alert('이미 등록되어 있습니다.');
				}
			}
		});
	}

}


//수강신청(선행과정 체크)
function fnAppRegt(crsId, crsSeqId, ihidnumColctYn, ordtmLrnYn){

	var param = {'crsId' : crsId, 'crsSeqId' : crsSeqId,'ihidnumColctYn' : ihidnumColctYn, 'ordtmLrnYn' : ordtmLrnYn};
	var resultParam = "";

	if(confirm('신청 하시겠습니까?')){
		//선행과정 이수 확인
		jQuery.ajax({
			type : 'post',
			url : _URL_PRECED,
			dataType : 'text',
			data : param,
			async : false,
			success : function(data) {
				if(data == "Y"){
					//선행과정 체크 완료 callback
					fnSucc(param);
				}else if(data == "Z"){
					alert("로그인해 주시기 바랍니다.");
					location.href = _URL_LOGIN;
					return false;
				}else if(data == "C"){
					alert("이미 수료한 과정입니다.");
					return false;
				}else if(data == "D"){
					alert("이미 같은 과정을 수강신청 하셨습니다.");
					return false;
				}else{
					alert("선행 과정이 존재합니다. 선행과정을 먼저 수료해야 합니다.");
					return false;
				}
				resultParam = data;
			}
		});
	}

	if(resultParam != "" && resultParam != null){
		if(resultParam != 'Y'){
			fnSearch();
		}
	}

};

//선행과정 체크 완료 callback
function fnSucc(data){

	var param = {'crsId' : data.crsId, 'crsSeqId' : data.crsSeqId, 'ordtmLrnYn' : data.ordtmLrnYn};
	var resultParam = "";
	var regtNo = "";

	//수강신청
	jQuery.ajax({
		type : 'post',
		url : _URL_APP_REGT,
		dataType : 'text',
		data : param,
		async : false,
		success : function(data) {
			var jsonData = $.parseJSON(data);
			regtNo = jsonData[0].regtNo;
			var completeYn = jsonData[0].completeYn;
			if(completeYn == "Y"){
				fnOpenPopup({
					url : _URL_POPUP,
					name : 'APP_REGT_POPUP',
					width : '540',
					height : '770',
					param : param
				});
				//return false;
			}
			else if(completeYn == "C"){
				alert("수강신청이 완료 되었습니다.");
			}
			else if(completeYn == "D"){
				alert("학습정원이 초과되어 수강신청을 할 수 없습니다.");
			}
			else if(completeYn == "N"){
				alert("수강신청에 실패 하였습니다.");
			}
			else if(completeYn == "I"){
				alert("청년 강소기업 체험 신청자만 수강가능 합니다.\n확인 버튼을 누르시면 강소기업 체험 신청 화면으로\n이동 되오니 강소기업 체험 신청 후 수강하시기 바랍니다. ");
				var url = $("#gangsoUrl").val();
				window.open(url,'','');
			}
			else if(completeYn == "X"){
				alert("핸드폰 번호가 없습니다.\n핸드폰 번호가 있어야 수강신청이 가능합니다.\n회원정보 수정 후 수강신청을 해주시기 바랍니다.");
				location.href = '/cyberedu/cyb/customer/information/modify/modifyInformationModifyModify.do';
			}
			else if(completeYn == "P"){
				alert("해당 과정에 대한 과거 패널티 내역이 존재하여, 수강신청이 불가합니다.");
			}
			resultParam = completeYn;
		}
	});

	if(resultParam == "Y" || resultParam == "C"){
		if(regtNo != ""){
		  	 var ajax = new keis.ajax('/cyberedu/cyb/mypage/lectroom/main/checkLectroomMain.do', "POST", "text");
			 ajax.addParam('lrnRegtNo', regtNo);
			 ajax.addParam('lrnCrsId', data.crsId);
			 ajax.addParam('lrnCrsSeqId', data.crsSeqId);
			 ajax.send(function(resultObj){
				if (resultObj == 'E0') {
					location.href="/cyberedu/cyb/mypage/lectroom/main/retrieveLectroomMainDetail.do?lrnRegtNo="+regtNo+"&lrnCrsId="+data.crsId+"&lrnCrsSeqId="+data.crsSeqId;
				} else if (resultObj == 'E9') {
					alert('로그인후 이용해주세요.');
				} else if (resultObj == 'E8') {
					alert('본인인증 후 이용이 가능합니다.');
					location.href = "/cyberedu/cyb/customer/information/modify/modifyInformationModifyInfo.do?redirectUrl="+"/cyb/mypage/lectroom/main/retrieveLectroomMainDetail.do?lrnRegtNo="+regtNo+"&lrnCrsId="+data.crsId+"&lrnCrsSeqId="+data.crsSeqId;
				} else {
					alert('학습자 정보가 일치하지 않습니다. 다시 시도해주시기 바랍니다.');
				}
			 });
		}else{
			fnSearch();
		}
	}else if(resultParam != "" && $("#searchListYn").val() == "Y"){
		fnSearch();
	}
}


/*************************************상세화면***************************************/

//목록
function fnList(){
	_FRM_LIST.target = "_self";
	_FRM_LIST.action = _URL_LIST;
	_FRM_LIST.submit();
}

//수강취소

function fnCancelRegt(crsSeqId, crsId, cnlChkDt, cnlDt, regtStatCd){

	var param = {'crsSeqId': crsSeqId, 'crsId' : crsId,
			'cnlChkDt' : cnlChkDt, 'cnlDt' : cnlDt, 'regtStatCd' : regtStatCd};

	var resultParam = 0;

	if(confirm('수강취소 하시겠습니까?')){
		jQuery.ajax({
			type : 'post',
			url : _URL_CNE_REGT,
			dataType : 'text',
			data : param,
			async : false,
			success : function(data) {
				if(data == "Y"){
					alert('수강이 취소 되었습니다.');
					resultParam++;
				}else if(data == "D"){
					alert("수강취소가 가능한 상태가 아닙니다.");
					resultParam++;
				}else if(data == "I"){
					alert("수강취소 기간이 아닙니다.");
					resultParam++;
				}else if(data == "M"){
					if(confirm('마이페이지에서 가능합니다.\n확인을 누르시면 마이페이지로 이동합니다.')){
						_FRM_LIST.target = "_self";
						_FRM_LIST.action = _URL_MYPAGE;
						_FRM_LIST.submit();
						return false;
					}
					resultParam++;
				}else if(data == "N"){
					alert("수강취소에 실패 하였습니다.");
				}
			}
		});
	}

	if(resultParam > 0 && $("#searchListYn").val() == "N"){
		$("#crsId").val(crsId);
		$("#crsSeqId").val(crsSeqId);
		_FRM_LIST.target = "_self";
		_FRM_LIST.action = _URL_DETAIL;
		_FRM_LIST.submit();
	} else if(resultParam > 0 && $("#searchListYn").val() == "Y"){
		_FRM_SEARCH.target = "_self";
		_FRM_SEARCH.action = _URL_LIST;
		_FRM_SEARCH.submit();
	}

}

//수강신청(선행과정 체크)
function fnDetailAppRegt(crsId, crsSeqId, ihidnumColctYn, ordtmLrnYn){

	var param = {'crsId' : crsId, 'crsSeqId' : crsSeqId, 'ihidnumColctYn' : ihidnumColctYn, 'ordtmLrnYn' : ordtmLrnYn};

	if(confirm('신청 하시겠습니까?')){
		//선행과정 이수 확인
		jQuery.ajax({
			type : 'post',
			url : _URL_PRECED,
			dataType : 'text',
			data : param,
			async : false,
			success : function(data) {
				if(data == "Y"){
					//선행과정 체크 완료 callback
					fnDetailSucc(param);
				}else if(data == "Z"){
					alert("로그인해 주시기 바랍니다.");
					location.href = _URL_LOGIN;
					return false;
				}else if(data == "C"){
					alert("이미 수료한 과정입니다.");
				}else if(data == "D"){
					alert("이미 같은 과정을 수강신청 하셨습니다.");
				}else{
					alert("선행 과정이 존재합니다. 선행과정을 먼저 수료해야 합니다.");
					return false;
				}
			}
		});
	}

}

//선행과정 체크 완료 callback
function fnDetailSucc(data){

	var param = {'crsId' : data.crsId, 'crsSeqId' : data.crsSeqId, 'ordtmLrnYn' : data.ordtmLrnYn};
	var resultParam = "";

	jQuery.ajax({
		type : 'post',
		url : _URL_APP_REGT,
		dataType : 'text',
		data : param,
		async : false,
		success : function(data) {
			if(data == "Y"){
				fnOpenPopup({
					url : _URL_POPUP,
					name : 'APP_REGT_POPUP',
					width : '540',
					height : '770',
					param : param
				});
			}
			else if(data == "C"){
				alert("수강신청이 완료 되었습니다.");
			}
			else if(data == "D"){
				alert("학습정원이 초과되어 수강신청을 할 수 없습니다.");
			}
			else if(data == "I"){
				alert("청년 강소기업 체험 신청자만 수강가능 합니다.\n확인 버튼을 누르시면 강소기업 체험 신청 화면으로\n이동 되오니 강소기업 체험 신청 후 수강하시기 바랍니다. ");
				var url = $("#gangsoUrl").val();
				window.open(url,'','');
			}
			else if(data == "N"){
				alert("수강신청에 실패 하였습니다.");
			}else if(data == "X"){
				alert("핸드폰 번호가 없습니다.\n핸드폰 번호가 있어야 수강신청이 가능합니다.\n회원정보 수정 후 수강신청을 해주시기 바랍니다.");
				location.href = '/cyberedu/cyb/customer/information/modify/modifyInformationModifyModify.do';
			}
			resultParam = data;
		}
	});

	if(resultParam != "" && $("#searchListYn").val() == "N"){
		$("#crsId").val(data.crsId);
		$("#crsSeqId").val(data.crsSeqId);
		_FRM_LIST.target = "_self";
		_FRM_LIST.action = _URL_DETAIL;
		_FRM_LIST.submit();
	}

}
//
////관심과정등록
//function fnCrsBookMark(){
//	alert('${loginVO}');
//}

/*************************************팝업***************************************/


// TODO :수료증 정보 저장
function fnSavePopup(){

	if(isEmpty($("input[name='orgNm']").val())){
		alert('소속을 입력해 주세요');
		return false;
	}

	var param = {'regtNo' : $("#regtNo").val(), 'orgNm' : $("input[name='orgNm']").val()};

	jQuery.ajax({
		type : 'post',
		url : _URL_REGT_SAVE,
		dataType : 'text',
		data : param,
		async : false,
		success : function(data) {
			if(data == "Y"){
				alert('저장되었습니다.');
				self.close();
			}
			else if(data == "N"){
				alert("저장에 실패 하였습니다.");
			}
		}
	});

}

//일모아 ID 체크 및 신청 팝업
function fnIdChkPop(crsId, crsSeqId, ihidnumColctYn, ordtmLrnYn){


	if(confirm('신청 하시겠습니까?')){
		var param = {'crsId' : crsId, 'crsSeqId' : crsSeqId,'ihidnumColctYn' : ihidnumColctYn, 'ordtmLrnYn' : ordtmLrnYn};

		fnOpenPopup({
			url : _URL_ID_CHK_POPUP,
			data : param,
			name : 'APP_ID_CHK_POPUP',
			isLayer : true,
			width : '480',
			height : '400',
			param : param
		});
	}

	return false;
}

//일모아 ID 체크 및 신청상태 확인
function fnIdChk(crsId, crsSeqId, ihidnumColctYn, ordtmLrnYn){

	var ilmoaSysId = $('#ilmoaSysId').val();

	if(ilmoaSysId == '') {
		alert('ID를 입력해주세요.');
		$('#ilmoaSysId').focus();
		return false;
	}

	var param = {'crsId' : crsId, 'crsSeqId' : crsSeqId,'ihidnumColctYn' : ihidnumColctYn, 'ordtmLrnYn' : ordtmLrnYn, 'ilmoaSysId' : ilmoaSysId};
	var resultParam = "";

	//선행과정 이수 확인
	jQuery.ajax({
		type : 'post',
		url : _URL_ID_CHK,
		dataType : 'text',
		data : param,
		async : false,
		success : function(data) {
			if(data == "Y"){
				//선행과정 체크 완료 callback
				fnSucc(param);
			}else if(data == "E"){
				alert("ID를 입력해 주세요.");
				return false;
			}else if(data == "F"){
				alert("입력하신 일모아 시스템 ID가 확인 되지 않습니다.\nID를 확인하신 후 다시 수강신청 해 주세요.");
				return false;
			}else if(data == "X"){
				alert("입력하신 일모아 시스템 ID가 이미 수강신청 된 상태입니다.\n한 개의 ID로 중복 수강신청은 하실 수 없습니다.");
				return false;
			}else if(data == "Z"){
				alert("로그인해 주시기 바랍니다.");
				location.href = _URL_LOGIN;
				return false;
			}else if(data == "C"){
				alert("이미 수료한 과정입니다.");
				return false;
			}else if(data == "D"){
				alert("이미 같은 과정을 수강신청 하셨습니다.");
				return false;
			}else{
				alert("선행 과정이 존재합니다. 선행과정을 먼저 수료해야 합니다.");
				return false;
			}
			resultParam = data;
		}
	});


	if(resultParam != "" && resultParam != null){
		if(resultParam != 'Y'){
			fnSearch();
		}
	}

}

function fnNextList() {
	$("#pageIndex").val(Number($("#pageIndex").val()) + 1);
	$.ajax({
		type: 'POST',
		url: _URL_AJAX_LIST,
		data: $("#pageForm").serialize(),
		dataType: 'text',
		contentType: 'application/x-www-form-urlencoded;charset='+'utf-8',
		success: fnNextList_callBack
	});
}

function fnNextList_callBack(resultObj) {
	if(resultObj != null && resultObj != undefined){
		$("ul[class=education01]").append(resultObj);
	}
}
