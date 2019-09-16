///////////////////////////////////////////////////////////////////

jQuery(document).ready(function(){
		jQuery('#app_intro').hide(); 
		//navigator.splashscreen.hide();
});


//app = angular.module('app',['ngRoute','ngSanitize','ngTouch']).config( [
app = angular.module('app',['ngRoute','ngSanitize']).config( [
    '$compileProvider',
    function( $compileProvider )
    {   
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|whatsapp|fb-messenger|chrome-extension):/);
        // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
    }
]);

app.run(function($window,$http,Factory,$rootScope,$filter,$location) {

	  $rootScope.knowledgeCornerCategory = '';
	  
	  localStorage.backTo = -1;
	  
	  $rootScope.backButton = function(numPage) {
			numPage = numPage == undefined ? localStorage.backTo : numPage;
			$window.history.go(-1);
	  };
	  
      $rootScope.online = navigator.onLine;
      $window.addEventListener("offline", function() {
        $rootScope.$apply(function() {
          $rootScope.online = false;
        });
      }, false);

      $window.addEventListener("online", function() {
        $rootScope.$apply(function() {
          $rootScope.online = true;
        });
      }, false);
	  	  
});

app.config( function($routeProvider){
		
		/*   PAGES   */      
		$routeProvider.when('/',{controller:'HomeCtrl',templateUrl:'views/home.html'})
					  .when('/home',{controller:'HomeCtrl',templateUrl:'views/home.html'})		
		  			  .when('/knowledgeCorner',{controller:'knowlegeCornerCtrl',templateUrl:'views/knowledgeCorner.html'})
					  .when('/knowledgeItems/:catid/:catName',{controller:'knowlegeItemsCtrl',templateUrl:'views/knowledgeItems.html'})
					  .when('/chatMeetings',{controller:'chatMeetingsCtrl',templateUrl:'views/chatMeeting.html'})
					  .when('/trainings',{controller:'TrainingsOpportunitiesCtrl',templateUrl:'views/trainingOpportunities.html'})
					  .when('/quiz',{controller:'TrainingsQuizCtrl',templateUrl:'views/trainingQuiz.html'})
					  .when('/getQuiz',{controller:'QuizItemCtrl',templateUrl:'views/quizItem.html'})
					  .when('/trainingOpp/:id/:title',{controller:'TrainingItemCtrl',templateUrl:'views/trainingItem.html'});						  
		/*    ANY   */
		$routeProvider.otherwise({redirectTo:'/'});	
});

var controllers = {};
	
	controllers.TrainingsOpportunitiesCtrl = function ($scope,$window,$rootScope,Factory,$location){

			$scope.myPage = {};	
			$scope.myPage.q = 'trainings';
			$scope.myPage.displaySpinner = true;
			
			localStorage.backTo = -1;	

			var screenWidth = $window.innerWidth * 95.0/100.0;
			if($window.innerWidth<340){
				$scope.myPage.dbnameWidth = screenWidth * 92.0 /100.0;
			}else{
				$scope.myPage.dbnameWidth = screenWidth * 92.0 /100.0;		
			}
			
			
			Factory.getTrainingsOpportunities($scope.myPage.q).success( function(data){
					$scope.myPage.Categories = data;
					$scope.myPage.displaySpinner = false;
					angular.element(document).ready(function () {
							jQuery(".clickable-row").click(function() {
									window.location = $(this).data("href");
							});
					});
			}).error(function(error) {
					console.log(error);
			});
			

			
	};

	controllers.TrainingItemCtrl = function ($scope,$window,$rootScope,$routeParams,Factory,$location){

			$scope.myPage = {};	
			$scope.myPage.q = 'trainingItem';
			$scope.myPage.displaySpinner = true;
			
			$rootScope.knowledgeCornerCategory = $routeParams.title;
			
			localStorage.backTo = -1;	

			var screenWidth = $window.innerWidth * 95.0/100.0;
			if($window.innerWidth<340){
				$scope.myPage.dbnameWidth = screenWidth * 92.0 /100.0;
			}else{
				$scope.myPage.dbnameWidth = screenWidth * 92.0 /100.0;		
			}
			
			
			Factory.getTrainingItems($scope.myPage.q,$routeParams.id).success( function(data){
					$scope.myPage.CatItems = data;
					$scope.myPage.displaySpinner = false;
			}).error(function(error) {
					console.log(error);
			});
			
	};
	
	controllers.TrainingsQuizCtrl = function (){
		angular.element(document).ready(function () {
			StatusBar.backgroundColorByHexString("#FFC107");
			alert("Hello World");
		});
	};
	
	controllers.QuizItemCtrl = function ($scope,Factory,$route){
	
			$scope.myPage = {};	
			$scope.myPage.q = 'getQuestions';
			$scope.myPage.displaySpinner = true;		
			
			localStorage.backTo = -1;	
			
			$scope.reload = function(){
					$route.reload();
			};

			Factory.getQuestions($scope.myPage.q).success( function(data){
					$scope.myPage.QstItems = data;
					$scope.myPage.displaySpinner = false;
					
					var quizLength = $scope.myPage.QstItems.length;
					
					for(var i=0;i<quizLength;i++){
							for(var j=0;j<$scope.myPage.QstItems[i].data.length;j++){
								//console.log($scope.myPage.QstItems[i].data[j]['@attributes']);
								var idx = 0;
								/*$.each($scope.myPage.QstItems[i].data[j]['@attributes'], function(k, v) {
										if(k == "correct"){
												$scope.myPage.QstItems[i].correct = idx;
										}
										idx = idx +1;
								});*/
								try{
										if($scope.myPage.QstItems[i].data[j]['@attributes'].correct == "true") $scope.myPage.QstItems[i].correct = j;
								}catch(err) {}
							}
							
					} 
					
					
			}).error(function(error) {
					console.log(error);
			});
			
			angular.element(document).ready(function () {
				//Scorebox Grading
				jQuery('.tqGradeAll').click(function(e){

					$scope.myPage.showResultsSuccess = false;
					$scope.myPage.showResultsFailure = false;
					$scope.myPage.pointsAccum = 0;
					$scope.myPage.totalPoints = 0;
					$scope.myPage.unanswered = 0;
					$scope.myPage.correctans = 0;
					$scope.myPage.wrongans = 0;
					$scope.myPage.totalans = 0;		
					
				  // Modified by Jean-Michel: due to changes into the result tags
					
				  //  var displayAnsCount = jQuery(this).parent().data('genanscount');
					var displayAnsCount = jQuery('.tqScoreBox').data('genanscount');
				  //  var passScore = jQuery(this).parent().data('passscore');
					var passScore = jQuery('.tqScoreBox').data('passscore');
				  //  var langPoints = jQuery(this).parent().data('langpoints');
					var langPoints = jQuery('.tqScoreBox').data('langpoints');
				  //  var langCorrect = jQuery(this).parent().data('langcorrect');
					var langCorrect = jQuery('.tqScoreBox').data('langcorrect');
				  //  var langIncorrect = jQuery(this).parent().data('langincorrect');
					var langIncorrect = jQuery('.tqScoreBox').data('langincorrect');
				  //  var langNoAnswer = jQuery(this).parent().data('langnoanswer');
					var langNoAnswer = jQuery('.tqScoreBox').data('langnoanswer');
				  //  var passmessage = jQuery(this).parent().data('passmessage');
					var passmessage = jQuery('.tqScoreBox').data('passmessage');
				  //  var failmessage = jQuery(this).parent().data('failmessage');
					var failmessage = jQuery('.tqScoreBox').data('failmessage');
					jQuery('.tqQuestion').each(function(x){
							$scope.myPage.totalans ++;
							var thisPoints = jQuery(this).data('qpoints');
							$scope.myPage.totalPoints = +$scope.myPage.totalPoints + +thisPoints;
							var getGrade = 0;
							var questionType = jQuery(this).data('tqtype');
							if(questionType=="mchoice") {
								getGrade = gradeMchoice(jQuery(this));
							}
							else if(questionType=="text"){
								getGrade = gradeText(jQuery(this));
							}

							if (getGrade == 0){
								$scope.myPage.wrongans ++;
							}
							else if (getGrade == -1){
								$scope.myPage.unanswered ++;
							}
							else if (getGrade > 0){
								$scope.myPage.pointsAccum = +$scope.myPage.pointsAccum + +getGrade;
								$scope.myPage.correctans++;
							}
					});
					var percentScore = $scope.myPage.pointsAccum / $scope.myPage.totalPoints * 100;
					var percentScore = percentScore.toFixed(2);
					var passFail = 0;
					if (percentScore >= passScore){
						var output = passmessage + percentScore+"%.";
						passFail = 1;
					}
					else{
						var output= failmessage +percentScore+"%";
					}
					if(displayAnsCount=="yes"){

						output += ('<br\>'+langPoints+' '+ $scope.myPage.pointsAccum +'/'+totalPoints);
						output += ('<br\>'+langCorrect+' '+$scope.myPage.correctans+'/'+$scope.myPage.totalans);
					 //   output += ('<br\>'+langIncorrect+' '+wrongans+'/'+totalans); Modified by Jean-Michel
						output += ('<br\>'+$scope.myPage.langNoAnswer+' '+$scope.myPage.unanswered+'/'+$scope.myPage.totalans);
					}
					// jQuery(this).parent().siblings('span.tqScoreBoxResults').html(output);  
					 //Modified by Jean-Michel
					  //jQuery(this).parent().siblings().children('span.tqScoreBoxResults').html(output);

					//Feedback Bar
					if(jQuery(this).siblings('.tqFeedbackBar').length > 0){
						jQuery(this).siblings('.tqFeedbackBar').children('.tqColorBar').animate({right: 100 - percentScore + '%'});
						if(passFail == 1){
							jQuery(this).siblings('.tqFeedbackBar').children('.tqColorBar').css('background-color','green');
						}
						else{
							jQuery(this).siblings('.tqFeedbackBar').children('.tqColorBar').css('background-color','red');
						}
					}
					if(1.0*$scope.myPage.pointsAccum/$scope.myPage.totalPoints>=0.5){
						$scope.myPage.showResultsSuccess = !$scope.myPage.showResultsSuccess;
					}else{
						$scope.myPage.showResultsFailure = !$scope.myPage.showResultsFailure;
					}
					
					
					jQuery('#checkQuiz').hide();
					jQuery('#newQuiz').show();
					jQuery('body').scrollTop(0);
					
					$scope.$digest();

				});

				//Grades a mchoice given the tqQuestion elt, returns points, sets feedback
				function gradeMchoice(elt){
					//Determine correct ans
					var correctAns = jQuery(elt).data('correct');
					var plugindir = jQuery(elt).data('plugdir');
					var thisID = jQuery(elt).data('thisid');
					var msgCorrect = jQuery(elt).data('msgcorrect');
					var msgNoResponse = jQuery(elt).data('msgnoresponse');
					var msgWrong = jQuery(elt).data('msgwrong');
					//Check against RBs

					//Determine if no answers were chosen
					var rbCheck = jQuery('#tqMC_'+thisID+'_0');
					
					//Added by Jean-Michel: selectedAnswer
					var selectedAnswer = 0;
					var rbChecked = 0;
					var rbID = 0;
					var returnScore = 0;
					while (rbCheck.length > 0){
					
						jQuery('#label_'+thisID+'_'+rbID+'').removeClass('correct'); // By JM: Added to remove previous Evaluation
						if(rbCheck.is(':checked')){
							//Modified by Jean-Michel: 
							rbChecked = 1;
							selectedAnswer = rbID;	
						}
						rbID ++;
						var rbCheck = jQuery('#tqMC_'+thisID+'_'+rbID+'');
					}
					
					if(rbChecked == 0){
						jQuery(elt).find('.tqFeedbackMsg').text(msgNoResponse).css("color", "#f0ad4e");
						//jQuery(elt).find('.tqFeedbackNoAnswer').show().css("color", "#f0ad4e");
						jQuery('.tqFeedbackNoAnswer_'+thisID).show();
						
						//Change feedback image if exists
						if(jQuery(elt).find('.tqImgFeedback').length > 0){
							jQuery(elt).find('.tqImgFeedback').removeClass().addClass('tqImgFeedback question');
						}
						returnScore = -1;
					}
					//Correct or Incorrect: Hide radio button
					
					//jQuery('.radiobox_'+thisID+'_'+correctAns+'').hide();
					
					//Correct
					
					var quizType = '';
					try{
						quizType = document.getElementById('quizType').value;
					}catch(err){}
					
					if(quizType =='HaveYourSay'){  //By JM :  To accommodate HAVE YOUR SAY
								if (jQuery('#tqMC_'+thisID+'_'+correctAns+'').is(':checked')){
									jQuery(elt).find('.tqFeedbackMsg').text(msgCorrect).css("color", "#4CAF50");
									jQuery('#label_'+thisID+'_'+correctAns+'').addClass('correct');
								}else  if(rbChecked == 1){
									jQuery(elt).find('.tqFeedbackMsg').text(msgWrong).css("color","#4CAF50");   // Bottom text --- 
									jQuery('#label_'+thisID+'_'+selectedAnswer+'').addClass('correct');

								}
								
					}else{
					
									if (jQuery('#tqMC_'+thisID+'_'+correctAns+'').is(':checked')){
										//Change feedback image if exists
										//if(jQuery(elt).find('.tqImgFeedback').length > 0){      Removed by Jean-Michel
											// Removed by Jean-Michel: jQuery(elt).find('.tqImgFeedback').removeClass().addClass('tqImgFeedback correct');
											
											//Modified by Jean-Michel:  IF CORRECT
											jQuery('#tqMC_'+thisID+'_'+correctAns+'').hide();
											jQuery('#correct_'+thisID+'_'+correctAns+'').show();
											jQuery('#label_'+thisID+'_'+correctAns+'').addClass('correct');
											
									  //  }
										//Write Correct
										jQuery(elt).find('.tqFeedbackNoAnswer').hide();
										jQuery(elt).find('.tqFeedbackMsg').text(msgCorrect).css("color", "#4CAF50");
										jQuery(elt).find('.tqFeedbackGoodAnswer').show().css("color", "#4CAF50");
										returnScore = jQuery(elt).data('qpoints');
									}
									//Incorrect
									else if(rbChecked == 1){
										//Write Incorrect
										jQuery(elt).find('.tqFeedbackNoAnswer').hide();
										jQuery(elt).find('.tqFeedbackGoodAnswer').hide();
										jQuery(elt).find('.tqFeedbackMsg').text(msgWrong).css("color","red");   // Bottom text --- 
										jQuery(elt).find('.tqFeedbackWrongAnswer').show().css("color", "red");
										//Change feedback image if exists
							   //         if(jQuery(elt).find('.tqImgFeedback').length > 0){
										
											//Modified by Jean-Michel:  IF INCORRECT
											jQuery('#tqMC_'+thisID+'_'+correctAns+'').hide();
											jQuery('#tqMC_'+thisID+'_'+selectedAnswer+'').hide();
											jQuery('#correct_'+thisID+'_'+correctAns+'').show();
											jQuery('#wrong_'+thisID+'_'+selectedAnswer+'').show();
											jQuery('#label_'+thisID+'_'+correctAns+'').addClass('correct');
											jQuery('#label_'+thisID+'_'+selectedAnswer+'').addClass('wrong');
										
										   // Removed by Jean-Michel: jQuery(elt).find('.tqImgFeedback').removeClass().addClass('tqImgFeedback incorrect');
							   //         }
										returnScore = 0;
									}
					}
					console.log(returnScore);  // JM JM test
					return returnScore;
						};
				});
	};
	
	controllers.HomeCtrl = function ($scope,$rootScope,$location){

	};
	
	controllers.knowlegeCornerCtrl = function ($scope,$rootScope,$window,Factory,$location){
	
			$scope.myPage = {};	
			$scope.myPage.q = 'knwlg_corner';
			$scope.myPage.displaySpinner=true;
			
			$rootScope.knowledgeCornerCategory = '';
			localStorage.backTo = -1;
			
			var screenWidth = $window.innerWidth * 95.0/100.0;
			if($window.innerWidth<340){
				$scope.myPage.dbnameWidth = screenWidth * 92.0 /100.0;
			}else{
				$scope.myPage.dbnameWidth = screenWidth * 92.0 /100.0;		
			}
			
			Factory.getKnwledgeCorner($scope.myPage.q).success( function(data){
					$scope.myPage.Categories = data;
					$scope.myPage.displaySpinner=false;
					angular.element(document).ready(function () {
							jQuery(".clickable-row").click(function() {
									window.location = $(this).data("href");
							});
					});
			}).error(function(error) {
					console.log("erreur:" + error);
			});	

			$scope.itemsList = function(catid){
					$location.path('/knowledgeItems/' + catid);
			};
}; 
	
	controllers.knowlegeItemsCtrl = function ($scope,$rootScope,$window,Factory,$routeParams,$location){
	
			$scope.myPage = {};	
			$scope.myPage.q = 'knwlg_itms';
			
			localStorage.backTo = -1;
			
			var screenWidth = $window.innerWidth * 95.0/100.0;
			if($window.innerWidth<340){
				$scope.myPage.dbnameWidth = screenWidth * 92.0 /100.0;
			}else{
				$scope.myPage.dbnameWidth = screenWidth * 92.0 /100.0;		
			}
			$rootScope.knowledgeCornerCategory = $routeParams.catName;
			Factory.getKnwledgeItems($scope.myPage.q,$routeParams.catid).success( function(data){
					$scope.myPage.CatItems = data;
					angular.element(document).ready(function () {
							jQuery(".clickable-row").click(function() {
									window.location = $(this).data("href");
							});
					});
			}).error(function(error) {
					console.log("erreur:" + error);
			});			
	};	
	
	controllers.chatMeetingsCtrl = function ($scope,$rootScope,$window,Factory,$routeParams,$location){
	
			$scope.myPage = {};	
			$scope.myPage.q = 'chat_meetings';
			$scope.myPage.displaySpinner = true;
			
			localStorage.backTo = -1;
			
			var screenWidth = $window.innerWidth ;
			if($window.innerWidth<340){
				$scope.myPage.dbnameWidth = screenWidth * 96.0 /100.0;
			}else{
				$scope.myPage.dbnameWidth = screenWidth * 96.0 /100.0;		
			}
			
			Factory.getChatMeetings($scope.myPage.q).success( function(data){
					$scope.myPage.chatDates = data;
					$scope.myPage.displaySpinner = false;
			}).error(function(error) {
					console.log("erreur:" + error);
			});			
			
	};		

	app.controller(controllers);
	
	app.factory('Factory', function($http,$rootScope,$filter) {
		
			var factory = {};   //getQuestions
			
			URL = 'https://mgen.h3abionet.org/mgenData.php';

			factory.getQuestions = function(q){

					return  $http({
							url: URL,
							method: 'POST',
							data: {q:q}
					});
			};
			
			factory.getKnwledgeCorner = function(q){

					return  $http({
							url: URL,
							method: 'POST',
							data: {q:q}
					});
			};
			
			factory.getChatMeetings = function(q){

					return  $http({
							url: URL,
							method: 'POST',
							data: {q:q}
					});			
			}			
			
			factory.getKnwledgeItems = function(q,catid){

					return  $http({
							url: URL,
							method: 'POST',
							data: {q:q,catid:catid}
					});
			};	
			
			factory.getTrainingsOpportunities = function(q){
			
					return  $http({
							url: URL,
							method: 'POST',
							data: {q:q}
					});
			};
			
			factory.getTrainingItems = function(q, id){
			
					return  $http({
							url: URL,
							method: 'POST',
							data: {q:q, id:id}
					});
			};
			
			return factory;
	});
	
Date.prototype.addHours = function(h){
    this.setHours(this.getHours()+h);
    return this;
}