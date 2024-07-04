/**
 * type : more, list, load, json
 * 
 * @param option
 * @returns {UtilMore}
 */
UtilMore = function(option){
	this.defaults = {
			type : "more",
			pageName : null,
			page : 1,
			rows : 5,
			pageSize : 10,
			formatter : null,
			complete : null,
			json : null
	};
	$.extend(this.defaults, option);
	
	this.pager = {
			pageName : null,
			page : 1,
			rows : 5,
			pageSize : 10, 
			root : null,
			records : 0,
			total : 0
	};
	this.pager['pageName'] = this.defaults.pageName;
	this.pager['page'] = this.defaults.page;
	this.pager['rows'] = this.defaults.rows;
	this.pager['pageSize'] = this.defaults.pageSize;
	
	this.reload = false;
};

UtilMore.prototype = {
	init : function() {
		this.load();
		return this;
	},
	search : function(reload){
		/**
		 * reload : true 인경우 페이지 정보를 유지 하기 위함.
		 * 
		 * default 는 null 값으로 페이지 정보를 초기화함.
		 */
		if(!reload){
			this.reload = true;
			this.pager.page = 1;
			this.pager.records = 0;
		}
		this.load();
		return false;
	},
	page : function(page){
		this.pager.page = Number(page);
		this.load();
		return false;
	},
	more : function(){
		this.pager.page = Number(this.pager.page) + 1;
		this.load();
		return false;
	},
	load : function(){
		var obj = this;
		var defaults = this.defaults;
		var pager = this.pager;
		var param = new Array();
		
		if(isNotEmpty(defaults.formNm)){
			var frm = $("form[name='"+defaults.formNm+"']");
			param = frm.serializeArray();
			
			// 페이지정보를 FORM 에 저장함.
			if(isNotEmpty(pager.pageName)){
                var hiddenTag = $("input[name='" + pager.pageName + "']");
                if (hiddenTag.length == 0) {
                    hiddenTag = $('<input type="hidden" name="' + pager.pageName + '">');
                    hiddenTag.appendTo(frm);
                }
				hiddenTag.val(pager.page);
			}
		}
		
		param.push({name: "pageIndex", value : pager.page});
		param.push({name: "pageUnit", value : pager.rows});
		
		if(defaults.type == "load"){
			$("#"+defaults.targetId).load(defaults.url, param,function(responseText, textStatus, XMLHttpRequest){
				$("#"+defaults.targetId).empty();
				$("#"+defaults.targetId).html(responseText);
				obj.paging();
			});
		}
		else if(defaults.type == "json"){
			/**
			 * JSON Reader
			 */					
			obj.jsonReader(defaults.json);
			
			/**
			 * Load Complete
			 */
			obj.loadComplete();
		}		
		else{
			fnAjaxJsonParam(defaults.url, {param : param}, function(data){
				if(data){
					/**
					 * JSON Reader
					 */					
					obj.jsonReader(data);
					
					/**
					 * Load Complete
					 */
					obj.loadComplete();
				}
			});
		}
	},
	loadComplete : function(){
		var obj = this;
		var pager = this.pager;
		var defaults = this.defaults;
		if(pager.root && pager.root.length > 0){
			// ROW HTML 생성
			obj.create(defaults.type, obj.fmatter, defaults.formatter, defaults.templateId, defaults.targetId, pager.root);
			
			// 페이지 처리
			obj.paging();
		}
		else{
			obj.nodata();
		}
		
		// Complete Callback
		if($.isFunction(defaults.complete)){
			defaults.complete();
		}
	},
	// ROW HTML 생성
	create : function(type, fmatter, formatter, templateId, targetId, root){
		var obj = this;
		try{
			var tmpl = $("#"+templateId).html();
			var target = $("#"+targetId);
			if(type == "list"){
				target.empty();
			}
			if(this.reload && (type == "more" || type == "json")){
				this.reload = false;
				target.empty();
			}
			for(var index = 0 ; index < root.length ; index++){
				var html = tmpl;
				var json = root[index];
				html = html.replaceAll("@rowId@", index);
				$.each(json, function(key, val) {
					
					// XSS
					val = obj.htmlEncode(val);
					
					if(formatter){
						for(var num = 0 ; num < formatter.length ; num++){
							if(formatter[num].id == key){
								if(fmatter[formatter[num].formatter]){
									val = fmatter[formatter[num].formatter](val, formatter[num].formatoptions, index);
								}
								else{
									val = formatter[num].formatter(json, val, formatter[num].formatoptions);
								}
							}
						}
					}
					if(isEmpty(val)){
						html = html.replaceAll("@"+key+"@", "");
					}
					else{
						html = html.replaceAll("@"+key+"@", val);
					}
				});
				target.append(html);
			}
		}
		catch(e){
			alert(e);
		}
	},
	nodata : function(){
		var pager = this.pager;
		var defaults = this.defaults;
		var $target = $("#"+defaults.targetId);
		if(defaults.type == "list" || defaults.type == "json"){
			$target.empty();
			$target.append($("#"+defaults.emptyId).html());
		}
		else if(defaults.type == "more"){
			if(pager.records == 0){
				$target.empty();
				$target.append($("#"+defaults.emptyId).html());
			}			
		}
		$("#"+defaults.pagingId).empty().hide();			
	},
	paging : function(){
		var obj = this;
		var pager = this.pager;
		var defaults = this.defaults;
		
		var $pager = $("#"+defaults.pagingId).show();
		
		if(defaults.type != "more" && !$pager.hasClass("lay-pagenavi")){
			$pager.addClass("lay-pagenavi");
		}
		
		if(defaults.type == "more"){
			
			// records >= total 인 경우, total 가 0 인 경우
			if(pager.total == 0 || pager.records >= pager.total){
				$pager.empty();
			}
			else{
				
				if($pager.children('a').length == 0){
					var $link = $('<a>').prop({"href":"#", "class":"btn-txt btn-more"});
					$link.append("<span class=\"arrbox\"></span>");
					
					// 더보기 버튼
					$span = $('<span>').prop({"class":"name-box"});
					$span.append("<span class=\"baseline\"></span>");
					$span.append("<span class=\"name\">"+LBL_MORE+"</span>");
					
					$link.append($span);
					$link.bind('click', function(){
						obj.more();
						return false;
					});
					
					$pager.append($link);
				}				
			}
		}
		else if(defaults.type == "list" || defaults.type == "load"){
			// 페이지 삭제
			$pager.children().remove();
			
			// 전체 행 갯수
			var rowTotal = pager.total;
			var records = pager.records;
			
			// 그리드 목록이 있을 경우
			if(rowTotal > 0 && records > 0){

				// 현재 페이지
				var page = Number(pager.page);
				
				// 페이지당 행 갯수
				var rowNum = pager.rows;
				
				// 보여질 페이지 갯수 - < 1 2 3 4 5 6 7 8 9 10 >
				var viewCount = pager.pageSize;
				// 전체 페이지 갯수
				var pageCount = parseInt(rowTotal%rowNum) > 0 ? parseInt(rowTotal/rowNum)+1 : parseInt(rowTotal/rowNum);
				
				// 페이징
				var paginate = $('<div>', { 'class': 'pagenavi'});
				$pager.append(paginate);

				// 페이지 이벤트
				var pageRefresh = function(e){
					var rel = $(this).prop("rel");
					if(rel == 'prev'){
						if(page > 1) obj.page(page-1);
					}
					else if(rel == 'next'){
						if(page < pageCount) obj.page(page+1);
					}
					else if(rel != ''){
						obj.page(rel);
					}
					return false;
				};
				
				// 이전
				var btn_prev = $('<a>', { href:'#', click:pageRefresh , 'class': 'btn-txt btn-prev', rel:'prev' });
				btn_prev.append($('<span>',{'class':'name'}).append("<span class=\"pageIco pageIco-previous\"></span>"));
				paginate.append(btn_prev);
				paginate.append("\n");
                if (page <= 1) {
                	btn_prev.css('cursor', 'default');
                }
				
				// 보여질 페이지 처리 - < 1 2 3 4 5 6 7 8 9 10 >
				var round = parseInt(page%viewCount) == 0 ? parseInt(page/viewCount)-1 : parseInt(page/viewCount);
				var index = round * viewCount + 1;
				var maxIndex = (round + 1) * viewCount;
				for( ; index <= maxIndex && index <= pageCount ; index++){
					
					if(page == index){
						var btn_page = $('<span>', {'class': 'btn-txt selected'});
						btn_page.append($('<span>',{'class':'name'}).text(index));
						paginate.append(btn_page);
					}
					else{
						var btn_page = $('<a>', { href:'#', click:pageRefresh , 'class': 'btn-txt', rel:index});
						btn_page.append($('<span>',{'class':'name'}).text(index));
						paginate.append(btn_page);
					}
					paginate.append("\n");
				}

				// 다음
				var btn_next = $('<a>', { href:'#', click:pageRefresh , 'class': 'btn-txt btn-next', rel:'next' });
				btn_next.append($('<span>',{'class':'name'}).append("<span class=\"pageIco pageIco-next\"></span>"));
				paginate.append(btn_next);
                if (page >= pageCount) {
                	btn_next.css('cursor', 'default');
                } 
			}
		}
	},
	jsonReader : function(data){
		var defaults = this.defaults;
		var pager = this.pager;
		
		var reader = {
				root: function (obj) { 
					return obj.list;
				},
				total: function (obj) {
					return obj.total;
				},
				page: function (obj) { 
					return obj.page;
				},
				records: function (obj) { 
					return obj.records;
				}
			};
		
		/**
		 * 페이지 정보 설정
		 * 1. records는 현재 row 갯수를 저장함.
		 */
		$.each(reader, function(key, fn){
			if(defaults.type == "more" && key == "records"){
				pager[key] += fn(data);
			}
			else{
				pager[key] = fn(data);
			}
		});
	},
	getRowData : function(rowid){
		return this.pager.root[rowid];
	},
	getTotalCount : function(){
		return this.pager.records;
	},
	htmlEncode : function (value){
		return !value ? value : String(value).replace(/&/g, "&amp;").replace(/\"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	},
	fmatter : {
		label : function(cellValue, options){
			try{
				if(isEmpty(cellValue)){
					return "";
				}
				var json = options.data;
				if(json){
					var valueColumn = options.valueColumn;
					var nameColumn = options.nameColumn;
					if(nameColumn && valueColumn){
						for(var index in json){
							if(cellValue == json[index][valueColumn]){
								return json[index][nameColumn];
							}
						}
					}
					else{
						for(var index in json){
							if(cellValue == json[index].code){
								return json[index].name;
							}
						}	
					}					
				}
				return (isEmpty(cellValue)) ? "":cellValue;
			}
			catch(e){
				alert(e);
			}
		},
		/**
		 * jqGrid Formatter - Date Tag
		 * 
		 * formatter:'date'
		 * formatoptions:{pattern:'yyyy-MM-dd'}
		 */		
		date : function(cellValue, options){
			try{
				if(isEmpty(cellValue)){
					return "";
				}
				var pattern = null;
				if(options){
					pattern = options.pattern;
				}
				return cellValue.toDate(pattern);		
			}
			catch(e){
				alert(e);
			}			
		},
		link : function(cellValue, options, rowId){
			if(options.data){
				var json = options.data;
				var valueColumn = options.valueColumn;
				var nameColumn = options.nameColumn;
				for(var index in json){
					if(json[index][valueColumn] == cellValue){
						cellValue = json[index][nameColumn];
						break;
					}
				}
			}
			if(cellValue){
				if(options.zlass){
					return "<a class=\""+options.zlass+"\" onclick=\""+options.fn+"("+rowId+"); return false;\">"+cellValue+"</a>";
				}
				else{
					return "<a onclick=\""+options.fn+"("+rowId+"); return false;\">"+cellValue+"</a>";
				}
			}
			return cellValue;
		}
	}
};