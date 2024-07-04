$( document ).ready(function(){ 

		// 하단 공통 nav
		let btnMenu = $('.k-nav');
		let btnDiv = $('.nav_cnt');
		let notDiv = $('.page_area, .nav_close');

		$(btnMenu).each(function(){
			$(this).on('click',() =>  {
				$(this).toggleClass('active').siblings().removeClass('active');
				$('body').toggleClass('hidden');
				let targetHas =  $(this).hasClass('active');
				if(targetHas){
					$("#" + $(this).data('target')).addClass('active');
					$("#" + $(this).data('target')).siblings().removeClass('active');
				}else{
					$("#" + $(this).data('target')).removeClass('active');
				}
			});

			notDiv.on('click',() => {
				let btnMenuHas = btnMenu.hasClass('active');
				let btnDivHas = btnDiv.hasClass('active');
				if(btnMenuHas || btnDivHas){
					btnMenu.removeClass('active');
					btnDiv.removeClass('active');
					$('body').removeClass('hidden');
				}else{
					return false;
				}
			})
		});
  
		// 하단 공통 nav in 카테고리 메뉴
		$('.cate_nav dl dd').css('display','none');
		const cateNav = {
			click: function(target) {
			
				let $target = $(target);
				$target.on('click', function() {
  
					if ($(this).hasClass('on')) {
						slideUp($target);
						$(this).children('a').attr('title','열기')
					} else {
						slideUp($target);
						$(this).children('a').attr('title','닫기')
						$(this).addClass('on').next().slideDown(100);
					}
	  
					function slideUp($target) {
						$target.removeClass('on').next().slideUp(100);
					}
				});
			}
		};
		cateNav.click('.cate_nav dl dt');

		$('.topbtn').click(function (e) {
			e.preventDefault();
			$('html, body').animate({ scrollTop: 0 }, 500);
		}); // 위로 버튼
		
		$('.default_btn_area .btn, .tab_nav_item,.active_btn, .chk_btn_area .edu').on('click', function(){
			$(this).addClass('active').siblings().removeClass('active');
		  }); 
		  $('.line_tab_area li a').on('click', function(){
			$(this).parent('li').addClass('active').siblings().removeClass('active');
		  })
		  // 버튼 클릭 css event


		  //input focus  css event
		  $('.sch_event').on('focus', function(){
			  $(this).parent('.sch_area').addClass('focusIn');
		  });
		  $('.sch_event').on('blur', function(){
			$(this).parent('.sch_area').removeClass('focusIn');
		})


		//상단 이용안내 
		$('.use_info').on('click', function(){
			if($(this).hasClass('on') == false) {
				$(this).addClass('on').attr('title','이용안내 내용 닫기').next('.use_area').addClass('on');
			}else{
				$(this).removeClass('on').attr('title','이용안내 내용 닫기').next('.use_area').removeClass('on');
			}
		}) 

		if($(".common_prev_area button[class*=common_prev]").attr("onclick") == undefined) {
			//왼쪽상단 뒤로가기 버튼 링크가 들어있지않으면 모두 이전페이지로 보냄 아닐시 각 페이지에서 처리필요
			$(".common_prev_area button[class*=common_prev]").click(function(){
				history.back();
			})
		}
});


// 레이어 팝업
function layer_open(el){
	var temp = $('#' + el);
	var bg = temp.prev().hasClass('pop_bg');
	function reposition() {
	  if (temp.outerHeight() < $(document).height() ){
		temp.css('margin-top', '-'+temp.outerHeight()/2+'px');
	  }
	  else {
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

function f_moveLogin() {
	$("button[class*='btn_my']").trigger("click");
}
