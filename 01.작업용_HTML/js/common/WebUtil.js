/*******************************************************************************
 *
 * 파일명 : WebUtil.js
 * 2014.07.04 jinwook
 *
 * 화면에서 사용하는 공통 스크립트를 구현
 *
 ******************************************************************************/

/*******************************************************************************
 * LayoutPopup Callback Map
 ******************************************************************************/
var _callBackMap = null;

/*******************************************************************************
 * Ajax Json Param Function
 *
 * @param url
 * @param option - { obj : obj, param : {name1:value1, name2:value2}, async : false }
 * @param callback - function(data){}
 ******************************************************************************/
function fnAjaxJsonParam(url, option, callback) {
	jQuery.ajax({
		type : 'post',
		url : url,
		contentType : "application/x-www-form-urlencoded; charset=UTF-8",
		dataType : 'json',
		data : (option != null && option.param != null) ? option.param : null,
		async : (option != null && option.async != null) ? option.async : false,
		traditional : true,
		beforeSend: function (xhr) {
			_fnRequestHeaderCSRF(xhr);
		},
		success : function(data) {
			if (data != null) {
				callback(data, (option != null) ? option.obj : null);
			} else {
				return false;
			}
		},
		error : function(data, textStatus, errorThrown) {
			// 접근 제한
			if(data.status == "403"){
				location.href = _URL_LOGIN_FORM;
			}
			else{
				alert(MSG_ERROR);
			}

		}
	});
}

/*******************************************************************************
 * Ajax Json Form Function
 *
 * @param url
 * @param option - { obj : obj, formName : "searchForm" }
 * @param callback - function(data){}
 ******************************************************************************/
function fnAjaxFormSubmit(url, option, callback) {
	jQuery.ajax({
		type : 'post',
		url : url,
		contentType : "application/x-www-form-urlencoded; charset=UTF-8",
		dataType : 'json',
		data : $("form[name='" + option.formName + "']").serializeArray(),
		traditional : true,
		beforeSend: function (xhr) {
			$("span.errors").remove();
			_fnRequestHeaderCSRF(xhr);
		},
		success : function(data) {
			if (data != null) {
				// Validator Error 처리
				if(data.status == 'fail'){
					var errors = data.errorMessageList;
					$(errors).each(function(){
						var info = $(this)[0];
						if(isNotEmpty(info.code) && isNotEmpty(info.defaultMessage)){
							$("[name='"+info.code+"'],[id='"+info.code+"']").eq(0).after('<span class="errors">'+info.defaultMessage+'</span>');
						}
					});
				}
//				else{
					callback(data, (option != null) ? option.obj : null);
//				}
			} else {
				return false;
			}
		},
		error : function(data, textStatus, errorThrown) {
			// 접근 제한
			if(data.status == "403"){
				alert("ERROR 403 Access Denined");
//				location.href = _URL_LOGIN_FORM;
			}
			else{
				alert(MSG_ERROR);
			}
		}
	});
}

/*******************************************************************************
 * Ajax Multipart Function
 *
 * @param url
 * @param option - { obj : obj, formName : "searchForm" }
 * @param callback - function(data){}
 ******************************************************************************/
function fnMultipartSubmit(url, option, callback) {
	var frm = $("form[name='" + option.formName + "']");
	var options = {
		url : url,
		type : "POST",
		// IE9 이하에서 JSON 이 다운로드 되는 현상
		data : {
			contentType : 'text/html'
		},
		dataType : "json",
		beforeSend: function (xhr) {
			_fnRequestHeaderCSRF(xhr);
		},
		beforeSerialize : function() {
		},
		beforeSubmit : function(arr, $form, options) {
		},
		success : function(data, textStatus, jqXHR) {
			if (data != null) {
				if (callback != null) {
					callback(data, (option != null) ? option.obj : null);
				}
			}
		},
		complete : function(jqXHR, textStatus) {
		},
		timeout : 1000 * 60 * 60,
		error : function(jqXHR, textStatus, errorThrown) {
			// 시간 초과
			if (textStatus == "timeout") {
				alert(MSG_ERROR_07);
			}
			// 접근 제한
			else if(data.status == "403"){
				location.href = _URL_LOGIN_FORM;
			}
			else{
				alert(MSG_ERROR);
			}
		}
	};
	frm.ajaxSubmit(options);
}

/*******************************************************************************
 * Ajax Load Function
 *
 * @param url
 * @param option - { targetId : targetId, param : param }
 * @param complete - function(data){}
 ******************************************************************************/
function fnLoad(url, option, complete){

	if(isEmpty(option.targetId)){
		alert("Load Target Id is Empty !");
		return;
	}

	var self = $("#"+option.targetId);

	if( self.length > 0){
		jQuery.ajax({
			type : 'post',
			url : url,
			contentType : "application/x-www-form-urlencoded; charset=UTF-8",
			dataType : 'html',
			data : (option != null) ? option.param : null,
			beforeSend: function (xhr) {
				_fnRequestHeaderCSRF(xhr);
			},
			success : function(responseText) {
				if (responseText != null) {
					// HTML
					self.html(responseText);
					if($.isFunction(complete)){
						complete();
					}
				} else {
					return;
				}
			},
			error : function(data, textStatus, errorThrown) {
				alert(MSG_ERROR);
			}
		});
	}
}

/*******************************************************************************
 * 팝업 열기
 * 1. Window 팝업
 * {name : '팝업이름', url : '주소', param : {}, callbackFunction : '콜백함수명', multiselect : false, width : width, height : height}
 *
 * 2. Layer 팝업
 * {name : '팝업이름', url : '주소', param : {}, callbackFunction : '콜백함수명', multiselect : false, isLayer : true, width : width, height : height}
 * 팝업에서 width 와 height은 옵션입니다.
 *
 * @option name : Window 팝업명, Layer 팝업 id
 * @option url : 필수 입력
 * @option param : 파라미터
 * @option callbackFunction
 * @option multiselect : 다중선택 여부 , true - 다중선택, false - 단일선택
 * @option isLayer : Layer 팝업 여부 , true - Layer 팝업, false - Window 팝업
 * @option width
 * @option height
 *
 * @param complete - 팝업 호출 완료 후 실행될 함수
 ******************************************************************************/
function fnOpenPopup(data,  complete) {

	if (isEmpty(data.url)) {
		alert('URL - ERROR');
		return false;
	}

	if (isEmpty(data.name)) {
		alert('name - ERROR');
		return false;
	}

	var param = {};
	if (data.param != null) {
		param = data.param;
	}

	if (data.isLayer == true) {

		param.layoutId = data.name;
		param.callbackFunction = data.callbackFunction;
		param.multiselect = data.multiselect;
		param.isLayer = data.isLayer;
		param.layerWidth = data.width;
		param.layerHeight = data.height;

		jQuery.ajax({
			type : 'post',
			url : _CONTEXT_ROOT + data.url,
			contentType : "application/x-www-form-urlencoded; charset=UTF-8",
			dataType : 'html',
			data : param,
			beforeSend: function (xhr) {
				_fnRequestHeaderCSRF(xhr);
			},
			success : function(html) {
				if (html != null) {

					var $popupDiv = $('#'+data.name);

					// 신규 div 생성
					if($popupDiv.length == 0){
						$popupDiv = $("<div>").prop({"id":data.name,"class":_LAYER.layerClass});
						$popupDiv.appendTo($("#"+_LAYER.rootId));
					}
					else{
						// 초기화
						$popupDiv.empty();
					}
					$popupDiv.hide();

					var maxIndex = 100;
					$("*").each(function(index){
						var zIndex = $(this).zIndex();
						if(maxIndex < zIndex){
							maxIndex = zIndex;
						}
					});

					// Layer Background
					if($("div."+_LAYER.bgClass).length == 0){
						$("#"+_LAYER.rootId).eq(0).append($('<div class="'+_LAYER.bgClass+'">'));
					}
					$("div."+_LAYER.bgClass).zIndex(maxIndex);

					// 배경 Dim 보다는 상단에 위치 하도록 함
					$popupDiv.zIndex(++maxIndex);

					// Layer
					$("#"+_LAYER.rootId).show();

					// Layer Drag Option
					$popupDiv.draggable({
						handle : $("div."+_LAYER.dragClass),
						cursor : "move",
						containment : "document"
					});

					/**
					 * HTML append  를위치를 _LAYER.bgClass 레이어가 만들어진 이후에 등록함
					 * 사용자 검색 팝업에서 한명일 경우 화면이 자동으로 닫혀짐.(순서가 바뀔경우 배경레이어가 사라지지 않음)
					 */
					$popupDiv.html(html);

					// Layer Center Align
					$popupDiv.show();

					// Layer Complete Funation Call
					if($.isFunction(complete)){
						complete();
					}
				}
			},
			error : function(data, textStatus, errorThrown) {
				if(data.status == "403"){
					alert(MSG_403_ERROR);
				}
				else {
					alert('Layer Popup - ERROR');
				}
			}
		});
	} else {
		try {

			var style = "toolbar=no,status=no,directories=no,scrollbars=yes,location=no,resizable=no,border=0,menubar=no";
			var xpos = (screen.availWidth - data.width) / 2;
			var ypos = (screen.availHeight - data.height) / 2;
			style = style + ',top=' + ypos + ',left=' + xpos + ',width=' + data.width + ', height=' + data.height;

			window.open('', data.name, style);

			// FORM 생성
			var frm = $('<form>', {'action': data.url, 'target': data.name , 'method':'post'});
			$("body").append(frm);

			// CSRF
			var token = $("meta[name='_csrf']").attr("content");
			var header = $("meta[name='_csrf_parameter']").attr("content");
			if(isNotEmpty(token)){
				frm.append($('<input>', { 'name': header, 'value': token, 'type': 'hidden' }));
			}
			// 너비
			frm.append($('<input>', { 'name': 'layerWidth', 'value': data.width, 'type': 'hidden' }));
			// 높이
			frm.append($('<input>', { 'name': 'layerHeight', 'value': data.height, 'type': 'hidden' }));
			// Callback Function
			if (isNotEmpty(data.callbackFunction)) {
				frm.append($('<input>', { 'name': 'callbackFunction', 'value': data.callbackFunction, 'type': 'hidden' }));
			}
			// 다중선택 여부
			if (data.multiselect == true) {
				frm.append($('<input>', { 'name': 'multiselect', 'value': data.multiselect, 'type': 'hidden' }));
			}
			// Parameter
			$.each(param, function(key, value) {
				frm.append($('<input>', { 'name': key, 'value': value, 'type': 'hidden' }));
			});


			frm.submit();
			frm.remove();

			// Layer Complete Funation Call
			if($.isFunction(complete)){
				complete();
			}

			return true;
		} catch (e) {
			alert(e);
		}
		return false;
	}
}

/*******************************************************************************
 * 레이어 팝업 닫기
 *
 * @param obj
 *
 * 1. 해당팝업 최상위 레이어를 찾음
 * 2. 레이어 팝업 삭제
 * 3. 레이어 팝업이 없을 경우 배경 Dim Div 삭제
 * 4. 레이어 팝업이 있을 경우 배경 Dim Div 의 z-index 를 최상위 레이어 팝업의 z-index 보다 한단계 아래로 설정
 ******************************************************************************/
function fnLayerClose(layoutId) {

	if (isEmpty(layoutId)) {
		alert('layoutId - ERROR');
		return false;
	}

	var $popupDiv = $("#"+layoutId);
	if($popupDiv){
//		$popupDiv.fadeOut(300, function(){
			$popupDiv.remove();
			// 레이어 팝업이 없을 경우
			if($("div."+_LAYER.layerClass).length == 0){
				$("div."+_LAYER.bgClass).remove();
				$("#"+_LAYER.rootId).hide();
			}
			// 레이어 팝업이 있을경우 최상위 레이어 팝업의  z-index 아래로 popupLayerBg 의 z-index 를 설정
			else {
				var maxIndex = 100;
				$("div."+_LAYER.layerClass).each(function(index){
					var zIndex = $(this).zIndex();
					if(maxIndex < zIndex){
						maxIndex = zIndex;
					}
				});
				$("div."+_LAYER.bgClass).zIndex(--maxIndex);
			}
//		});
	}
}

/*******************************************************************************
 * Properties Message Arguments Replace
 *
 * ex) alert(fnMessageArguments(MSG_TEXT_LIMIT_ERROR, [ "제목", 100 ]));
 *
 * @param msg
 * @param args
 * @returns
 ******************************************************************************/
function fnMessageArguments(msg, args) {
	if (args) {
		if (typeof args == "object" && args.length) {
			for (var i = 0; i < args.length; i++) {
				var pattern = new RegExp("\\{" + i + "\\}", "g");
				msg = msg.replace(pattern, args[i]);
			}
		} else {
			msg = msg.replace(/\{0\}/g, args);
		}
	}
	return msg;
}

/*******************************************************************************
 * Select Tag Option Reset
 *
 * select option 목록을 삭제하고 json 목록 으로 재생성함.
 *
 * @param json
 * @param $target -
 *            jquery target
 * @param nameCode
 * @param valueCode
 * @param selectedVal
 ******************************************************************************/
function fnSelectReset(json, $target, nameCode, valueCode, selectedVal) {
	// Delete option other than the default
	$target.find('option').filter("[value!='']").remove();
	// Create a new option tag
	if (json != null && json.length > 0) {
		for (var index = 0; index < json.length; i++) {
			var option = $('<option value="' + json[index][valueCode] + '">').text(json[index][nameCode]);
			if (selectedVal == json[index][valueCode]) {
				option.prop({
					'selected' : 'selected'
				});
			}
			$target.append(option);
		}
	}
}

/*******************************************************************************
 * 체크박스 목록에서 하나 이상 체크 여부
 *
 * @param objName :
 *            오브젝트 이름
 * @returns : 하나 이상 체크시 true , 아닐경우 false fnIsChecked('checkValue')
 *
 ******************************************************************************/
function fnIsChecked(objName) {
	var obj = document.getElementsByName(objName);
	for (var i = 0; i < obj.length; i++) {
		if (obj[i].checked == true) {
			return true;
		}
	}
	return false;
}

/*******************************************************************************
 * 모든 HTML 태그를 제거함.
 *
 * @param $obj -
 *            jquery 객체
 ******************************************************************************/
function fnHtmlRemove($obj) {
	var txt = $obj.val();
	$obj.val(txt.replace(/(<([^>]+)>)/ig, ""));
}

/*******************************************************************************
 * 객체 길이 제한 체크 및 substring 1. 객체의 값 제한을 체크함. 2. 초과하는 글자는 뒤에서부터 잘라냄. 3. 초과시 알림
 * 메시지를 호출하고 false 를 반환함. 4. 정상시 true 반환함. true : 정상 , false : 초과
 *
 * @param
 ******************************************************************************/
function fnTextMaxByte(obj, limit, title) {
	var str = obj.value;

	if (isEmpty(str)) {
		return true;
	}

	if (stringByteSize(str) > limit) {
		alert(fnMessageArguments(MSG_TEXT_LIMIT_ERROR, [ title, limit ]));
		obj.value = fnSubstrUtf8Byte(str, 0, limit);
		obj.focus();
		return false;
	}
	return true;
}

/*******************************************************************************
 * 사용자 검색 팝업 호출
 *
 * ex) option 값 : {'param' : param, 'multiselect' : false, 'isLayer' : true, 'callbackFunction' : 'callbackFunction'}
 ******************************************************************************/
function fnSearchUserPopup(option){
	if(option == null){
		alert("옵션을 설정해 주세요.");
		return;
	}
    fnOpenPopup({url : _URL_SEARCH_USER,
    	name : "COMM_SEARCH_USER_POPUP",
        isLayer : option.isLayer,
        param : option.param,
        callbackFunction : option.callbackFunction,
        multiselect : option.multiselect,
        width : 550});
}

/*******************************************************************************
 * 사용자 검색 팝업 호출
 *
 * ex) option 값 : {'param' : param, 'multiselect' : false, 'isLayer' : true, 'callbackFunction' : 'callbackFunction'}
 ******************************************************************************/
function fnMultiSearchUserPopup(option){
	if(option == null){
		alert("옵션을 설정해 주세요.");
		return;
	}
    fnOpenPopup({url : _URL_SEARCH_USER2,
    	name : "COMM_SEARCH_USER_POPUP",
        isLayer : option.isLayer,
        param : option.param,
        callbackFunction : option.callbackFunction,
        multiselect : option.multiselect,
        width : 680});
}

/*******************************************************************************
 * 설문팝업 호출
 *
 * @param option
 * @param callback
 * @returns {Boolean}
 ******************************************************************************/
function fnSuvey(option, callback){
	if(option == null || option.param == null){
		alert("옵션을 설정해 주세요.");
		return false;
	}
	var param = option.param;
	if(isEmpty(param.survTermNo)){
		alert("설문기간번호를 설정해 주세요.");
		return false;
	}
	fnOpenPopup({
		url : _URL_SURVEY_POP,
		name : 'SURVEY_POPUP',
		isLayer : true,
		width : 800,
		height : 500,
		param : param,
		callbackFunction : '_fnSurveyCallback'
	});

	// Callback 정보 저장
	if(_callBackMap == null) _callBackMap = new Map();
	_callBackMap['_fnSurveyCallback'] = callback;

	return false;
}

/*******************************************************************************
 * 교육장소 검색 팝업 호출
 *
 * ex) option 값 : {'param' : param, 'isLayer' : true, 'callbackFunction' : 'callbackFunction'}
 ******************************************************************************/
function fnSearchEduPlacPopup(option){
	if(option == null){
		alert("옵션을 설정해 주세요.");
		return;
	}
    fnOpenPopup({url : _URL_SEARCH_EDU_PLAC_CLFC,
    	name : "COMM_SEARCH_EDU_PLAC_CLFC_POPUP",
        isLayer : option.isLayer,
        param : option.param,
        callbackFunction : option.callbackFunction,
        width : 710});
}

/*******************************************************************************
 * 설문 팝업 Callback 함수
 ******************************************************************************/
function _fnSurveyCallback(){
	_callBackMap['_fnSurveyCallback']();
}

/*******************************************************************************
 * Naver Smart Editor
 * @param app
 * @param targetId
 * @param mode
 ******************************************************************************/
function fnCreateEditor(app, targetId, mode) {
	try {
		var defaultMode = 'WYSIWYG';
		if(isNotEmpty(mode)){
			defaultMode = mode;
		}
		nhn.husky.EZCreator.createInIFrame({
			oAppRef: app,
			elPlaceHolder: targetId,
			sSkinURI: _URL_SMART_SKIN,
			//변경 알림창 제거
			htParams : {
				bUseToolbar : true,
				fOnBeforeUnload : function(){},
				//boolean
				fOnAppLoad : function(){},
				// 편집 모드 설정
				SE_EditingAreaManager : { sDefaultEditingMode : defaultMode }
			},
			fCreator: "createSEditor2"
		});
	} catch (e) {
		alert(e + "게시판 모듈 정보를 정상적으로 읽지 못했습니다.");
	}
}

/*******************************************************************************
 * 빈값 체크
 *
 * @param str
 * @returns {Boolean}
 ******************************************************************************/
function isEmpty(str) {
	if (str == "undefined")
		return true;
	if (str == null)
		return true;
	str = $.trim(str);
	if (str.length == 0)
		return true;
	return false;
}

/*******************************************************************************
 * 빈값 체크
 *
 * @param str
 * @returns {Boolean}
 ******************************************************************************/
function isNotEmpty(str) {
	return (isEmpty(str)) ? false : true;
}

/*******************************************************************************
 * 날짜 유효성 체크(DatePicker) yyyy-MM-dd
 *
 * @param str
 * @returns {Boolean}
 ******************************************************************************/
function isDate(str) {
	if (isNotEmpty(str)) {
		var regExp = /^([0-9]{4})-([0-9]{2})-([0-9]{2})/g;
		if (!regExp.test(str)) {
			return false;
		}
	}
	return true;
}

/*******************************************************************************
 * 부동소수점 숫자인지 음수부호도 포함하여 검사
 * @param str
 * @returns {Boolean}
 ******************************************************************************/
function isNumber(value){
	return !isNaN(parseInt(value, 10));
}

/*******************************************************************************
 * 엑셀 업로드 결과
 *
 * @param listId
 * @param data
 ******************************************************************************/
function fnExcelUploadResult(listId, data){
	var result = data.result;
	// 실패 정보
	var excelError = result.excelError;
	var vRownum = excelError ? excelError.total : 0;
	var vHeight = vRownum > 15 ? "250" : "auto";
	// 성공 갯수
	$("#successCount").text(result.excelSuccess+LBL_COUNT);
	// 실패 갯수
	$("#failCount").text(((excelError) ? excelError.total : "0")+LBL_COUNT);
	if(excelError){
		$("#gbox_"+listId).show();
		if($("#gbox_"+listId).length == 0){

			var colNames = ['오류메시지'];
			var colModel = [{name:'excelErrorMsg', sortable: false, align:"left", width:200}];

			// 엑셀 필드 정보 설정
			$.each(excelError.field, function(key, value){
				colNames.push(value);
				colModel.push({name:key, sortable: false, width:60});
			});

			// 엑셀 업로드 양식이 올바르지 않아 그리드를 생성할 수 없을 경우.
	        if(colNames.length != colModel.length){
	        	alert('엑셀 양식이 올바르지 않아 업로드 내역을 표시 할수 없습니다.');
	        	return false;
	        }

			$("#"+listId).jqGrid({
				datatype : "jsonstring",
				datastr : JSON.stringify(excelError),
				colNames : colNames,
				colModel : colModel,
				height : vHeight,
				rowNum: vRownum,
				autowidth : true,
				shrinkToFit : true,
				sortable : false,
				gridview : true,
				gridComplete : function(){
	                $( window ).resize(function() {
	                	try{
	                        var offset = $("#gbox_" + listId).offset().left - 7;
	                        $("#gbox_" + listId).find(".ui-jqgrid-resize-mark").css("margin-left", "-"+offset+"px");
	                	}
	                	catch(e){}
	            	}).trigger("resize");
				}
			});
		}
		else{
			$("#"+listId).setGridParam({
				datatype : "jsonstring",
				datastr:JSON.stringify(excelError)
			}).trigger("reloadGrid");
		}
	}
	else{
		$("#gbox_"+listId).hide();
	}
}

/*******************************************************************************
 * checkbox 전체 선택/해지
 *
 * 전체 선택 checkbox name, id 값은 _checkCheckbox
 * 선택 checkbox name, id 값은 _selectCheckbox
 *
 ******************************************************************************/
function fnSelectedAllCheckbox(_checkCheckbox, _selectCheckbox) {
	if($("input:checkbox[name="+_checkCheckbox+"]").is(":checked")) {
		$("input:checkbox[name="+_selectCheckbox+"]").prop("checked", true);
	} else {
		$("input:checkbox[name="+_selectCheckbox+"]").prop("checked", false);
	}
}

/*******************************************************************************
 * 해당 태그 안에 있는 모든 이미지를 너비를 조정함.
 *
 * 1. 자신보다 너비가 큰 사이즈의 이미지만.
 * @param txt
 * @returns
 ******************************************************************************/
function fnInnerImgResize($parent){
	$parent.find('img').each(function(){
		$(this).load(function(){
			if($(this).width() > $parent.width()){
				$(this).width($parent.width());
			}
		});
	});
}

/*******************************************************************************
 * Spring Security CSRF
 *
 * 1. Set Request Header jQuery Ajax
 * @param xhr
 ******************************************************************************/
function _fnRequestHeaderCSRF(xhr){
	try{
		var token = $("meta[name='_csrf']").attr("content");
		var header = $("meta[name='_csrf_header']").attr("content");
		xhr.setRequestHeader(header, token);
	}
	catch(error){}
}


/*******************************************************************************
 * DEXT5 File Upload
 * TODO : 150710(Khsub)
 ******************************************************************************/
function fn_click(obj) {
    var elementsA = document.getElementsByTagName('a')
    var elementsALength = document.getElementsByTagName('a').length;

    for (var idx = 0; idx < elementsALength; idx++) {
        if (elementsA[idx] == obj)
            elementsA[idx].className = "on";
        else
            elementsA[idx].className = "";
    }

    var contentTitle = document.getElementById("contentTitle");
    contentTitle.innerHTML = obj.innerHTML;

    var iframeObj = document.getElementById("contentFrame");
    iframeObj.src = obj.href;

    return false;
}


String.prototype.trim = function() {
	return this.replace(/\s/g,"");
};

/*******************************************************************************
 * input#objId value=objVal
 ******************************************************************************/
function fnIdSetValue(objId, objVal) {
	$("#"+objId).val(objVal);
}