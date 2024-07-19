var loginUrl = '';
var regtCheckUrl = '';
var lectureRoomUrl = '';

function f_login(){
	location.href = sContext + "/cyb/customer/information/login/retrieveInformationLoginProcess.do";
}

function f_logout() {
	var $form = $('<form></form>');
	$form.attr("action", sContext + "/cyb/customer/information/login/retrieveInformationLogoutProcess.do");
	$form.attr("method", "post");
	$form.attr("target", "_self");
	$form.appendTo('body');
	$form.submit();
}

function f_getRegtInfo(regtNo, crsId, crsSeqId) {
	var ajax = new keis.ajax(regtCheckUrl, "POST", "text");
	$("#lrnRegtNo").val(regtNo);
	$("#lrnCrsId").val(crsId);
	$("#lrnCrsSeqId").val(crsSeqId);
	ajax.addParam('lrnRegtNo', regtNo);
	ajax.addParam('lrnCrsId', crsId);
	ajax.addParam('lrnCrsSeqId', crsSeqId);
	ajax.send('f_getRegtInfo_callBack');
}

function f_getRegtInfo_callBack(resultObj) {
	if (resultObj == 'E0') {
		var f = document.forms[0];
		f.action = lectureRoomUrl;
		f.target = "_self";
		f.submit();
	} else if (resultObj == 'E9') {
		alert('로그인후 이용해주세요.');
	} else if (resultObj == 'E8') {
		alert('본인인증 후 이용이 가능합니다.');
		var f = document.forms[0];
		var _input = document.createElement("input");
		_input.type = "hidden";
		_input.value = lectureRoomUrl.replace("/cyberedu", "")+"?lrnRegtNo="+f.lrnRegtNo.value+"&lrnCrsId="+f.lrnCrsId.value+"&lrnCrsSeqId="+f.lrnCrsSeqId.value;
		_input.name = "redirectUrl";
		f.appendChild(_input);
		f.action = "/cyberedu/cyb/customer/information/modify/modifyInformationModifyInfo.do";
		f.submit();
	} else {
		alert('학습자 정보가 일치하지 않습니다. 다시 시도해주시기 바랍니다.');
	}
}

function htmlEncoding(b) {
	return !b ? b : ("" + b).replace(/</g, "&lt;").replace(/>/g, "&gt;");
};