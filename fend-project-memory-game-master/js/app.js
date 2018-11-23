/*
 * Create a list that holds all of your cards
 */
 const cards = ['diamond', 'paper-plane-o', 'anchor', 'bolt', 'cube', 'leaf', 'bicycle', 'bomb'];
 let cardWaiting = null;
 let moveCounter = 0;
 let lockUIEvents = false;
 let timer = 0;
 let starRating = 5;
 let timerIntervalId, ratingIntervalId;
 
/*
 * Display the cards on the page
 *   - shuffle the list of cards using the provided "shuffle" method below
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */
 function displayCardsOnPage(){
	let cardsDuplicated = shuffle([...cards, ...cards]);
	
	let ulElement = document.createElement('ul');
	ulElement.className = "deck";
	for(let card of cardsDuplicated){
		let cardElement = document.createElement('li');
		cardElement.className = "card";
		let iElement = document.createElement('i');
		iElement.className = `fa fa-${card}`;
		
		cardElement.addEventListener('click', cardClicked);
		
		cardElement.appendChild(iElement);
		ulElement.appendChild(cardElement);
	}
	let container = document.querySelector('.container');
	container.appendChild(ulElement);
	setTimers();
 }
 
 /*
  * Refreshes cards on refresh button click
  */
 function refreshCards(){
	moveCounter = 0;
	timer = 0;
	starRating = 5;
	displayStarRating();
	clearTimers();
	cardWaiting = null;
	document.querySelector('span.moves').innerHTML = moveCounter;
	document.querySelector('ul.deck').remove();
	displayCardsOnPage();
 }
 
  /*
  * Initializes screen on first page load
  */
 function initializeScreen(){
	document.querySelector('#materialModalButtonOK').addEventListener('click', confirmReplay);
	document.querySelector('#materialModalButtonCANCEL').addEventListener('click', rejectReplay);
	document.querySelector('span.moves').innerHTML = moveCounter;
	let refreshElement = document.querySelector('div.restart');
	refreshElement.addEventListener('click', refreshCards);
	displayCardsOnPage();
 }
 
  /*
  * Sets a timer function to run timer on every seconds
  */
 function setTimers(){
	second = 0;
	timerIntervalId = setInterval(() => {
		timer++;
		let timeFormatted = getTimeFormatted();
		document.querySelector('span.timer').innerHTML = `Timer: ${timeFormatted}`;	
	}, 1000);

	ratingIntervalId = setInterval(displayStarRating, 30000);
 }
 /*
  * Clears all timer methods
  */
 function clearTimers() {
     clearInterval(timerIntervalId);
     clearInterval(ratingIntervalId);
 }
 
  /*
  * Evaluates star rating calculation mechanism
  */
 function displayStarRating() {
     if (starRating >= 0) {
         starRating -= 0.5;
         let starElements = document.querySelectorAll('ul.stars li');
         for (let index = 0; index < 5; index++) {
             let iStarElement = starElements[index].querySelector('i');
             if (starRating - index <= 0) {
                 iStarElement.className = 'fa fa-star-o';
             }
             else if (starRating - index == 0.5) {
                 iStarElement.className = 'fa fa-star-half-o';
             }
             else {
                 iStarElement.className = 'fa fa-star';
             }
         }
     }
 }
 
  /*
  * Formats time to display on screen properly
  */
 function getTimeFormatted() {
    let hours   = Math.floor(timer / 3600);
    let minutes = Math.floor((timer - (hours * 3600)) / 60);
    let seconds = timer - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours + ':' + minutes + ':' + seconds;
}

 /*
  * Shuffles cards on game initialization
  * function from http://stackoverflow.com/a/2450976
  */
function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
	
    return array;
}


/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */
function cardClicked(event)
{
	if(!lockUIEvents){
		let selectedCard = event.target;
		if(cardWaiting == null){
			toggleCardOpened(selectedCard);
			cardWaiting = selectedCard;
			moveCounter++;
		}
		else if(selectedCard.querySelector('i').classList[1] == cardWaiting.querySelector('i').classList[1]){
			if(!selectedCard.classList.contains('open')){
				toggleCardMatch(selectedCard);
				toggleCardMatch(cardWaiting);
				cardWaiting = null;
				if(gameCompleted()){
					let timeFormatted = getTimeFormatted();
					openModal('You Won!', `Congratulations you completed the game with ${moveCounter} moves, ${starRating} star rating and on ${timeFormatted}. Do you want to play again?`);
				}
				moveCounter++;
			}
		}
		else{
			toggleCardOpened(selectedCard);
			lockUIEvents = true;
			setTimeout(() => {
				toggleCardOpened(selectedCard);
				toggleCardOpened(cardWaiting);
				cardWaiting = null;
				lockUIEvents = false;
			}, 1000);
			moveCounter++;
		}
		document.querySelector('span.moves').innerHTML = moveCounter;
	}
}

//Opens a new confirm modal dialog
function openModal(title, text){
	document.getElementById('materialModalTitle').innerHTML = title;
	document.getElementById('materialModalText').innerHTML = text;
	document.getElementById('materialModalButtonCANCEL').style.display = 'none';
	document.getElementById('materialModal').className = 'show';
	document.getElementById('materialModalButtonCANCEL').style.display = 'block';
}

//Closes modal dialog
function closeModal(){
	document.getElementById('materialModal').className = 'hide';
}

//Accepts confirm modal dialog question
function confirmReplay()
{
	refreshCards();
	closeModal();
}

//Reject confirm modal dialog question
function rejectReplay(){
	clearTimers();
	closeModal();
}

  /*
  * Toggles cards open and show classes on cards click
  */
function toggleCardOpened(card){
	card.classList.toggle("open");
	card.classList.toggle("show");
}

 
  /*
  * Toggles cards match class on two cards match
  */
function toggleCardMatch(card){
	card.classList.toggle("match");
}
 
  /*
  * Returns a boolean value if game is completed or not
  */
function gameCompleted(){
	let completedCount = document.querySelectorAll('li.match').length;
	return completedCount == cards.length * 2;
}


initializeScreen();

