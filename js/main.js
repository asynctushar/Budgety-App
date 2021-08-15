//*************************************************************
//*************************************************************
//*************************************************************
//***************** Budget App Project ************************
//*************************************************************
//*************************************************************
//*************************************************************


// Budget Controller

var budgetController = (function() {
	
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};
	
	Expense.prototype.calcpercentage = function(totalIncome) {
		
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};
	
	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};
	
	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};
	
	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(cur) {
			sum += cur.value;
		});
		data.totals[type] =  sum;
		
	}
	
	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};
	
	
	//**********************localStorage*************************
		

	var prevData = function () {
		return JSON.parse(localStorage.getItem('data'));
	};
	
	
	
	
	
	
		
	
	return {
		addItem: function(type, des, val) {
			var newItem, ID;




			// create new ID
			if (data.allItems[type].length > 0 ) {

				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;

			} else {
				ID = 0;
			}


			// Create new item based on 'inc' or 'exp' type
			if (type === 'exp') {
				newItem = new Expense(ID, des, val);
			 }	else if (type === 'inc') {
					newItem = new Income(ID, des, val);
				}

			// Push it into our data structure 
			data.allItems[type].push(newItem);

		 	 localStorage.setItem('data', JSON.stringify(data));
			
					
			// Return the new element
			return newItem;
		},
		
		deleteItem: function(type, id) {
			var ids, index;
		
			ids = data.allItems[type].map(function(current) {
				
				return current.id;
		
			});
	
			index = ids.indexOf(id);
	
			if (index !== -1) {
				
				data.allItems[type].splice(index, 1);
				
			}
		
		
		},
		
		calculateBudget: function() {
			
			// calculate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');
			
			// calculate the budget: income - expenses
			data.budget = data.totals.inc - data.totals.exp;
			
			// calculate the percentage of income that we spent
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			}
			
			
		},
		
		calculatePecentages: function() {
			
			data.allItems.exp.forEach(function(cur) {
				cur.calcpercentage(data.totals.inc);
			})
			
		},
		
		getPercentage: function() {
			var allPerc = data.allItems.exp.map(function(cur) {
			return cur.getPercentage();
		});
			return allPerc;
		},
		
		getBudget: function() {
			return {
				
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
				
			};
		},
		
		
		saveStorage: function() {
			return prevData();
		},
		
		
		testing: function() {
			console.log(data);
		}
	};
	
})();

//UI Controller

var UIController = (function() {
	
	var DOMstrings = {
		inputType: '.add_type',
		inputDescription: '.add_description',
		inputValue: '.add_value',
		inputBtn: '.add_btn',
		incomeContainer: '.income_list',
		expensesContainer: '.expenses_list',
		budgetLebel: '.budget_value',
		incomeLebel: '.budget_income_value',
		expensesLebel: '.budget_expenses_value',
		percentageLebel: '.budget_expenses_percentage',
		container: '.container',
		expensesPercentageLebel:'.item_percentage',
		dateLebel: '.budget_title_month'
		};
	
	var formatNumber = function(num, type) {
			var numSplit, int, dec, type;
			
			num = Math.abs(num);
			num = num.toFixed(2);
			
			numSplit = num.split('.');
			
			int = numSplit[0];
		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
			
		}
			
			dec = numSplit[1];
			
			return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
			
		};
	
	var nodeListForEach = function(list, callback) {
				
				for (var i = 0; i < list.length; i++) {
					callback(list[i], i);
				}
				
			};
	
	return {
		getInput: function() {
			return {
				type: document.querySelector(DOMstrings.inputType).value, //Will be either inc or exp
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},
		
		addListItem: function(obj, type) {
			var html, newHtml, element;
			
			
			//Create HTML string with placeholder text
			if (type === 'inc') {
				element = DOMstrings.incomeContainer;
				
				html = '<div class="item clearfix" id="inc-%id%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_delete"></div><button class="item_delete-btn"><i id="close" class="far fa-times-circle"></i></i></button></div></div>';
			} else if (type === 'exp') {
				element = DOMstrings.expensesContainer;
				
				html = '<div class="item clearfix" id="exp-%id%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_percentage">55%</div><div class="item_delete"></div><button class="item_delete-btn"><i id="close" class="far fa-times-circle"></i></i></button></div></div>'
			}
			
			
			//Replace the placeholder text with some actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%',obj.description);
			newHtml = newHtml.replace('%value%',formatNumber(obj.value, type));
			
			//Insert the HTML into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
				
		},
		deleteListItem: function(selectorID) {
			var el;
			
			el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);							 
			
		},
		
		clearfields: function() {
			var fields, fieldsArr;
			
			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
			
			fieldsArr = Array.prototype.slice.call(fields);
			
			fieldsArr.forEach(function(current, index, array) {
				current.value = "";
			});
			
			fieldsArr[0].focus();
		},
		
		displayBudget: function(obj) {
			
			document.querySelector(DOMstrings.budgetLebel).textContent = obj.budget;
			document.querySelector(DOMstrings.incomeLebel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expensesLebel).textContent = formatNumber(obj.totalExp, 'exp');
			if(obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLebel).textContent = obj.percentage + '%';
			}else {
				document.querySelector(DOMstrings.percentageLebel).textContent = '---';

			}
			
		},
		
		displayPercentages: function(percentages) {
			
			var fields = document.querySelectorAll(DOMstrings.expensesPercentageLebel);
			
			nodeListForEach(fields, function(current, index) {
				
				if (percentages[index] > 0) {
					
					current.textContent = percentages[index] + '%';
					
				} else {
					
					current.textContent = '---';
					
				}
				
			});
			
			
		},
		
		displayMonth: function() {
			var now, months, month, year;
			
			now = new Date();
			
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			month = now.getMonth();
			
			year = now.getFullYear();
			document.querySelector(DOMstrings.dateLebel).textContent = months[month] + ' ' + year;
			
		},
			 
		changeType: function() {
			
			var fields = document.querySelectorAll(
				DOMstrings.inputType + ',' +
				DOMstrings.inputDescription + ',' +
				DOMstrings.inputValue);
			
			nodeListForEach(fields, function(cur) {
				
				cur.classList.toggle('red-focus');
				
			});
			
			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
			
		},
		
		getDOMstrings: function() {
			return DOMstrings;
		}
	};
})();

//Global App Controller

var controller = (function(budgetCtrl, UICtrl) {
	var DOM = UICtrl.getDOMstrings();
	
	
	var setupEventListeners = function() {
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
		document.addEventListener('keypress', function(event) {
	
			if(event.keyCode === 13 || event.which === 13) {
				ctrlAddItem();	
			}
		});

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
	}
	
	
	var updateBudget = function() {
		
		//Calculate the budget
		budgetCtrl.calculateBudget();
		
		//Return the budget 
		var budget = budgetCtrl.getBudget();
		
		//Display the budget on the UI
		UICtrl.displayBudget(budget);
	};
	
	var updateParcentages = function() {
		
		// Calculate percentages
		budgetCtrl.calculatePecentages();
		
		// Read percentages from the budget controller
		var parcentages = budgetCtrl.getPercentage();
		
		// Update the UI with the new percentages
		UICtrl.displayPercentages(parcentages);
		
	};
	
	
	
	var ctrlAddItem = function() {
		
		//Get the filled input data
		 var input = UICtrl.getInput();
		
		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
		
			//Add the item to the Budget Controller
			var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			//Add the item to the UI
			UICtrl.addListItem(newItem, input.type);

			//Clear the fields
			UICtrl.clearfields();

			//Calculate & update budget
			updateBudget();
			
			//Calculate and update percentages
			updateParcentages();
		
		}
		console.log(budgetCtrl.saveStorage());
	};
	
	var ctrlDeleteItem = function(event) {
		var itemID, splitID, type, ID;
		
		if (event.target.parentNode.parentNode.parentNode.id) {
			itemID = event.target.parentNode.parentNode.parentNode.id;
			
		} else if(event.target.parentNode.parentNode.parentNode.parentNode.id) {
			itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
			
		}
		
		
		if(itemID) {
			
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);
			
			// Delete the item from the data structure
			budgetCtrl.deleteItem(type, ID);
			
			// Delete the item from the UI
			UICtrl.deleteListItem(itemID);
			
			// Update and show the new budget
			updateBudget();
			
			//Calculate and update percentages
			updateParcentages();
			
		}

	};
	
	return {
		init: function() {
			UICtrl.displayMonth();
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setupEventListeners();
		}
	};

})(budgetController, UIController);

controller.init();





























































































































