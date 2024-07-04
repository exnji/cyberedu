$( document ).ready(function(){

	$('.topbtn').click(function (e) {
		e.preventDefault();
		$('html, body').animate({ scrollTop: 0 }, 500);
	}); // 위로 버튼

	$('.gnb ul li, .tab_nav_item, .chk_btn_area .btn, .default_btn_area .btn, .btn_month_area .btn, .tab_nav li.tab_nav_item, .line_tab_area li').on('click', function(){
		$(this).addClass('active').siblings().removeClass('active');
	}); // 메인 검색 찾기 버튼

	//스크롤 고정 header
	if($( '.header' ).length > 0) {
		var Offset = $( '.header' ).offset();
		$( window ).scroll( function() {
			if ( $( document ).scrollTop() > Offset.top ) {
				$( '.header' ).addClass( 'fixed' );
			} else {
				$( '.header' ).removeClass( 'fixed' );
			}
		});
	}

	//select
	$("div[class^=select_box] > a").on("click", function() {
		var targetPer = $(this).parent().hasClass("active");

		$("div[class^=select_box]").each(function(){
			$(this).children("ul").hide();
			$(this).children("a").removeClass('off');
			$(this).removeClass("active");
		});

		if(targetPer){
			$(this).parent().removeClass("active");
			$(this).next("ul").hide();
			$(this).removeClass("off");
		}else{
			$(this).parent().addClass("active");
			$(this).next("ul").show();
			$(this).addClass("off");
		}
		return false;
	});

	$("div[class^=select_box] > ul > li").each(function() {
		$(this).on('click', function() {
			fn_selectTrigger($(this));
		});
	});

	//gnb 
	function hideEvent(){
		$(".full_bg").slideUp(200);
		$(".depth2").slideUp(100);
		$('.nav_dimmed').css("display","none");
	}

	$(".gnb a.depth_title, .depth2 a, .depth2").on('focus focusin mouseenter',function() {
		$(this).parent('li').addClass('active').siblings().removeClass('active')
		if($(".full_bg").css("display") != "block"){  
			$('.nav_dimmed').css("display","block");
			$("div.full_bg").slideDown(200);
			$(".depth2").slideDown(200);
		}
	});

	$(".full_bg").on('focusout',function() {
		hideEvent();
	});

	$(".nav_dimmed").on('focusout mouseleave, mouseover',function() {
		hideEvent();
	})

		  // 하단 고정
		  //  if($('.main.container').height() <= 514){
		  //   $('#footer').removeClass('fixed');
		  //   $('#footer').addClass('fixed');
		  //  }else if($('.main.container').height() <= 590){
		  //   $('#footer').addClass('fixed');
		  //  }
		  //  else{
		  //   $('#footer').removeClass('fixed');
		  //  }

	if($(".content_area").length > 0) {
		if($(".content_area").height() < 400) {
			$(".content_area").css("height", $(".content_area").height() + 70 + "px");
		}
	}
})

// 레이어 팝업
function layer_open(el){
	var temp = $('#' + el);
	var bg = temp.prev().hasClass('pop_bg');
	function reposition() {
		if (temp.outerHeight() < $(document).height() ){
			temp.css('margin-top', '-'+temp.outerHeight()/2+'px');
		} else {
			temp.css('top', '0px');
		}
		if (temp.outerWidth() < $(document).width() ) {
			temp.css('margin-left', '-'+temp.outerWidth()/2+'px');
		} else {
			temp.css('left', '0px');
		}
	}

	function scrollDisable(){
		$('html, body').addClass('hidden');
	}
	function scrollAble(){
		$('html, body').removeClass('hidden');
	}

	$(window).on('load', function(){
		if(bg) {
			$('.layer').fadeIn();  
		} else {  
			temp.fadeIn(); 
		}
		reposition();
		scrollDisable();
	});

	temp.find('a.cbtn').click(function(e){
		if(bg){
			$('.layer').fadeOut();
		}else{
			temp.fadeOut();
		}
		scrollAble();
		e.preventDefault();
	}); 
	$('.layer .pop_bg').click(function(e){
		$('.layer').fadeOut();
		scrollAble();
		e.preventDefault();
	});
}

//동영상
let giMenuDuration = 300;
function ShowMenu(){
	$('.menu' ).css( { 'left' : '-100%' }).addClass('open');
	$('.menu' ).animate( { left: '0px' }, { duration: giMenuDuration, complete:function(){
	$('.movie_area' ).animate({ left: '180px'},300) }
	});
}

function HideMenu(){
	$('.menu' ).animate( { left: '-100%' }, { duration: giMenuDuration, complete:function(){ 
	$('menu' ).css( { 'display' : 'black' })
	}
	});
	$('.menu' ).removeClass('open'); 
	$('.movie_area' ).animate({ left: '0px'},300)
}

$( document ).ready( function(){
	$('.tree').each(function(){
		let $this = $(this);
		$this.find('li').each(function(){
			if(!$(this).children('ul').length){
				$(this).addClass('final');
			}
			if($(this).is(':last-child')){
				$(this).addClass('last');
			}
			$(this).append('<span></span>');
		});
		$this.find('li>span').on('click',function(){ 
			if($(this).parent('li').hasClass('unfold')){ 
				$(this).parent('li').removeClass('unfold');
			} else {
				$(this).parent('li').addClass('unfold');
			}
		});
	});

	//동영상 레이어팝업 닫기
	$('#btnMovieClose').on('click', function(){
		self.close();
	})

});

function fn_selectTrigger(_selectBox) {
	_selectBox.parent().hide().parent("div[class^=select_box]").children("a").text(_selectBox.text());
	_selectBox.parent().hide().parent("div[class^=select_box]").children("a").removeClass('off');
	_selectBox.prependTo(_selectBox);

	var targetPer = _selectBox.parent().parent("div[class^=select_box]").hasClass("active");
	if(targetPer){
		$("div[class^=select_box]").each(function(){
			$(this).children("ul").hide();
			$(this).children("a").removeClass('off');
			$(this).removeClass("active");
		});
	}else{
		_selectBox.parent().hide().parent("div[class^=select_box]").addClass("active");
	}
}