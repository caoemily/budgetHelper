var DataModule = (function(){
    var Income = function(id, des, val){
        this.id = id;
        this.des = des;
        this.val = val;
    };
    var Expense = function(id, des, val){
        this.id = id;
        this.des = des;
        this.val = val;
    };
    var data = {
        allItems:{
            allIncome:[],
            allExpense:[]
        },
        totals:{
            totalIncome:0,
            totalExpense: 0
        } 
    }

    var updatePercentage = function() {
        var percentage = 100*data.totals.totalExpense/data.totals.totalIncome;
        if (percentage>100 || isNaN(percentage)){
            percentage = '--';
        }
        else{
            percentage = percentage+'%';
        }
        return percentage;
    }

    return {
        addDataToMod:function(type, des, val){
            if (type=="inc"){
                var incomes, length, id, curItem;
                incomes = data.allItems.allIncome;
                length = incomes.length;
                length==0?id=0:id = incomes[length-1].id + 1;
                curItem = new Income(id, des, val);
                data.allItems.allIncome.push(curItem);
                return incomes[length];
            }
            else{
                var expenses, length, id, curItem;
                expenses = data.allItems.allExpense;
                length = expenses.length;
                length==0?id=0:id= expenses[length-1].id + 1;
                curItem = new Expense(id, des, val);
                data.allItems.allExpense.push(curItem);
                return expenses[length];
            }
        },
        deleteItem: function (type, ID){
            var ids, index, total, percentage;
            if (type=="inc"){
                data.allItems.allIncome.forEach(function(current, ind, array){
                    if (current.id==ID) index=ind;
                });
                if (index!==-1){
                    data.totals.totalIncome -= data.allItems.allIncome[index].val;
                    data.allItems.allIncome.splice(index,1);
                    total = data.totals.totalIncome;
                }
            }
            else {
                data.allItems.allExpense.forEach(function(current, ind, array){
                    if (current.id==ID) index=ind;
                });
                if (index!=-1){
                    data.totals.totalExpense -= data.allItems.allExpense[index].val;
                    data.allItems.allExpense.splice(index,1);
                    total = data.totals.totalExpense;
                }
            }
            percentage = updatePercentage();
            return {
                total: total,
                budget: data.totals.totalIncome - data.totals.totalExpense,
                percentage: percentage
            }  
        },
        updateTotal:function(type,val){
            var total, percentage;
            if (type=="inc"){
                data.totals.totalIncome += val;
                total = data.totals.totalIncome;
            }
            else{
                data.totals.totalExpense += val;
                total = data.totals.totalExpense;
            }
            percentage = parseInt(updatePercentage())+'%';
            return {
                total: total,
                budget: data.totals.totalIncome - data.totals.totalExpense,
                percentage: percentage
            };
        }, 
        getPercentage: function(){
            var percentages =[], per, totalIncome;
            totalIncome = data.totals.totalIncome;
            data.allItems.allExpense.forEach(function(current, index, array){
                if (totalIncome==0){
                    per = '--';
                }
                else{
                    per = parseInt(current.val/totalIncome*100) + '%';
                }
                percentages.push (per);
            });
            return percentages;
        }, 
    }
})();

var UIModule = (function(){
    return {
        getInput: function(){
            return {
                inputType: document.querySelector('.add_type').value,
                inputDes: document.querySelector('.add_description').value,
                inputValue: parseFloat(document.querySelector('.add_value').value),
                inputId: document.querySelector
            };
        },
        putOnList: function(newItem, type){
            var html,newHtml,element;
            if (type=='inc'){
                element = '.income_list';
                html = 
                '<div class="item" id="inc-%id%">'+
                    '<div class="item_description">%des%</div>'+
                    '<div class="item_right">'+
                        '<div class="item_value">%val%</div>'+
                        '<div class="item_delete"><button class="btn btn-default delete_btn">delete</button></div>'+
                    '</div></div>';
            }
            else{
                element = '.expense_list';
                html='<div class="item" id="exp-%id%">'+
                '<div class="item_description">%des%</div>'+
                '<div class="item_right"><div class="item_value">%val%</div>'+
                '<div class="item_percentage">%percentage%</div>'+
                '<div class="item_delete"><button class="btn btn-default delete_btn">delete</button></div>'+
                '</div></div>';
            } 
            newHtml=html.replace('%id%', newItem.id);
            newHtml=newHtml.replace('%des%', newItem.des);
            newHtml=newHtml.replace('%val%', newItem.val);
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        clearInputField: function(){
            var fields = document.querySelectorAll('.add_description'+','+'.add_value');
            fields = Array.prototype.slice.call(fields);
            fields.forEach(function(current, index, array){
                current.value = "";
            });
            fields[0].focus();
        },
        updateBudget: function(type, total, budget, percentage){
            var field;
            if(type == 'inc'){
                field = '.budget_income_value';  
                document.querySelector(field).innerHTML = total;
            }
            else {
                field = '.budget_expense_value';
                document.querySelector(field).innerHTML = total; 
            }
            document.querySelector('.budget_value').textContent = budget;
            document.querySelector('.budget_expense_percentage').innerHTML = percentage;
        }, 
        deleteItem: function (itemID){
            var item = document.getElementById(itemID);
            item.parentNode.removeChild(item);
        }, 
        updatePerForEachItem: function (percentages){
            var fields = document.querySelectorAll('.item_percentage');
            for (var i=0; i<percentages.length; i++){
                fields[i].textContent = percentages[i];
            }
        },
        displayMonth: function(){
            var now, year, month; 
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth()+1;
            document.querySelector('.month_year').textContent = year + ' - '+month;
        },
        changeType: function() {
            var fields = document.querySelectorAll
            ('.add_type'+','+'.add_description'+','+'.add_value');
            for (var i=0; i<fields.length; i++){
                fields[i].classList.toggle('red_focus');
            }
            document.querySelector('.add_btn').classList.toggle('red_btn');
        }
    };
})();

var ControlModule = (function(data, ui){
    var addItem = function(){
        var input, newItem, total, type, des, val, budget, percentages;
        input = ui.getInput();
        type = input.inputType;
        des = input.inputDes;
        val = input.inputValue;
        if (des!=="" && !isNaN(val) && val>0){
            newItem = data.addDataToMod(type, des, val);
            ui.putOnList(newItem,type);
            ui.clearInputField();
            total = data.updateTotal(type, val);
            ui.updateBudget(type, total.total, total.budget, total.percentage);
            percentages = data.getPercentage();
            ui.updatePerForEachItem(percentages); 
        }
            
    };
    var deleteItem = function(event){
        var itemID, splitID, type, ID, total, percentages;
        itemID = event.target.parentNode.parentNode.parentNode.id;
        if (itemID){
            splitID=itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            ui.deleteItem (itemID);
            total = data.deleteItem (type, ID);
            ui.updateBudget(type, total.total, total.budget, total.percentage);
            percentages = data.getPercentage();
            ui.updatePerForEachItem(percentages);
        }
        
    }
    var setupListeners = function(){
        document.querySelector('.add_btn').addEventListener('click',addItem);
        document.addEventListener('keypress',function(e){
            if(e.keyCode===13){
               addItem(); 
            }
        });
        document.querySelector('.bottom').addEventListener('click',deleteItem);
        document.querySelector('.add_type').addEventListener('change',ui.changeType);
    };
    return{
        init: function(){
            setupListeners();
            ui.displayMonth();
        }
    };
})(DataModule, UIModule);

ControlModule.init();