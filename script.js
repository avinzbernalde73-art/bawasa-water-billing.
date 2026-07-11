// ===========================
// BAWASA Water Billing System
// ===========================

let billingData = [];
let currentPaymentIndex = -1;

// ---------------- TABS ----------------

function showTab(tabId) {
  
  document.getElementById("billingTab").style.display = "none";
  document.getElementById("historyTab").style.display = "none";
  document.getElementById("paymentTab").style.display = "none";
  
  document.getElementById(tabId).style.display = "block";
  
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  
  event.target.classList.add("active");
  
}

// ---------------- ADD RECORD ----------------

function addRecord() {
  
  const month = document.getElementById("month").value;
  const member = document.getElementById("member").value;
  const previous = Number(document.getElementById("previous").value);
  const present = Number(document.getElementById("present").value);
  const remaining = Number(document.getElementById("remaining").value);
  
  if (month === "" || member === "") {
    alert("Please complete all fields.");
    return;
  }
  
  if (present < previous) {
    alert("Present reading cannot be lower than previous.");
    return;
  }
  
  const cubicUsed = present - previous;
  
  const excess = Math.max(0, cubicUsed - 10);
  
  const excessAmount = excess * 15;
  
  const minimumAmount = 150;
  
  const total = minimumAmount + excessAmount;
  
  const totalDue = total + remaining;
  
  billingData.push({
    
    month,
    member,
    previous,
    present,
    cubicUsed,
    excess,
    excessAmount,
    minimumAmount,
    total,
    remaining,
    totalDue,
    paid: 0,
    status: "UNPAID"
    
  });
  
  displayTable();
  
  clearInputs();
  
}

// ---------------- CLEAR INPUTS ----------------

function clearInputs() {
  
  document.getElementById("member").selectedIndex = 0;
  document.getElementById("previous").value = "";
  document.getElementById("present").value = "";
  document.getElementById("remaining").value = 0;
  
}

// ---------------- DISPLAY TABLE ----------------

function displayTable() {
  
  const body = document.getElementById("tableBody");
  
  body.innerHTML = "";
  
  let totalCollection = 0;
  
  billingData.forEach((item, index) => {
    
    totalCollection += item.totalDue;
    
    body.innerHTML += `

<tr>

<td>${index+1}</td>

<td>${item.month}</td>

<td>${item.member}</td>

<td>${item.previous}</td>

<td>${item.present}</td>

<td>${item.cubicUsed}</td>

<td>${item.excess}</td>

<td>₱${item.excessAmount.toFixed(2)}</td>

<td>₱${item.minimumAmount.toFixed(2)}</td>

<td>₱${item.total.toFixed(2)}</td>

<td>₱${item.remaining.toFixed(2)}</td>

<td>₱${item.totalDue.toFixed(2)}</td>

<td>${item.status}</td>

<td>

<button onclick="deleteRecord(${index})">

Delete

</button>

</td>

</tr>

`;
    
  });
  
  document.getElementById("totalMembers").textContent = billingData.length;
  
  document.getElementById("totalCollection").textContent = totalCollection.toFixed(2);
  
}

// ---------------- DELETE ----------------

function deleteRecord(index) {
  
  if (confirm("Delete this record?")) {
    
    billingData.splice(index, 1);
    
    displayTable();
    
  }
  
}

// ---------------- SEARCH ----------------

function searchMember() {
  
  let input = document.getElementById("search").value.toLowerCase();
  
  let rows = document.querySelectorAll("#tableBody tr");
  
  rows.forEach(row => {
    
    row.style.display = row.innerText.toLowerCase().includes(input) ? "" : "none";
    
  });
  
}

// ---------------- CLEAR ALL ----------------

function clearAll() {
  
  if (confirm("Clear all current month records?")) {
    
    billingData = [];
    
    displayTable();
    
  }
  
}
// ===============================
// SAVE & LOAD USING LOCAL STORAGE
// ===============================

function saveData(){

    localStorage.setItem("bawasaBilling", JSON.stringify(billingData));

}

function loadData(){

    const data = localStorage.getItem("bawasaBilling");

    if(data){

        billingData = JSON.parse(data);

        displayTable();

        updatePaymentSummary();

        loadMonths();

    }

}

window.onload = function(){

    loadData();

};

// Override displayTable so it always saves

const oldDisplayTable = displayTable;

displayTable = function(){

    oldDisplayTable();

    saveData();

    loadMonths();

    updatePaymentSummary();

};

// ===============================
// LOAD BILLING MONTHS
// ===============================

function loadMonths(){

    const monthSelect = document.getElementById("paymentMonth");

    monthSelect.innerHTML =
    '<option value="">Select Month</option>';

    let months=[];

    billingData.forEach(item=>{

        if(!months.includes(item.month)){

            months.push(item.month);

        }

    });

    months.forEach(month=>{

        monthSelect.innerHTML +=

        `<option value="${month}">${month}</option>`;

    });

}

// ===============================
// LOAD PAYMENT MEMBERS
// ===============================

function loadPaymentMembers(){

    const month=document.getElementById("paymentMonth").value;

    const table=document.getElementById("paymentTable");

    table.innerHTML="";

    billingData.forEach((item,index)=>{

        if(item.month===month){

            table.innerHTML +=

            `

<tr>

<td>${index+1}</td>

<td>${item.month}</td>

<td>${item.member}</td>

<td>₱${item.totalDue.toFixed(2)}</td>

<td>₱${item.paid.toFixed(2)}</td>

<td>₱${(item.totalDue-item.paid).toFixed(2)}</td>

<td>${item.status}</td>

<td>

<button onclick="openPayment(${index})">

Pay

</button>
Pay

</button>

</td>

</tr>

`;

        }

    });

}

// ===============================
// OPEN PAYMENT MODAL
// ===============================

function openPayment(index){

    currentPaymentIndex=index;

    document.getElementById("paymentModal").style.display="block";

    document.getElementById("paymentMemberName").innerHTML=

    "<b>"+billingData[index].member+"</b>";

    document.getElementById("paymentAmount").value="";

}

// ===============================
// CLOSE PAYMENT MODAL
// ===============================

function closePayment(){

    document.getElementById("paymentModal").style.display="none";

}

// ===============================
// CONFIRM PAYMENT
// ===============================

function confirmPayment(){

    const amount=Number(document.getElementById("paymentAmount").value);

    if(amount<=0){

        alert("Enter a valid payment.");

        return;

    }

    const bill=billingData[currentPaymentIndex];

    bill.paid += amount;

    if(bill.paid>=bill.totalDue){

        bill.paid=bill.totalDue;

        bill.status="PAID";

    }else{

        bill.status="PARTIALLY PAID";

    }

    saveData();

    displayTable();

    loadPaymentMembers();

    closePayment();

}

// ===============================
// PAYMENT SUMMARY
// ===============================

function updatePaymentSummary(){

    let collect=0;

    let paid=0;

    let remaining=0;

    let paidMembers=0;

    let unpaidMembers=0;

    billingData.forEach(item=>{

        collect+=item.totalDue;

        paid+=item.paid;

        remaining+=(item.totalDue-item.paid);

        if(item.status==="PAID"){

            paidMembers++;

        }else{

            unpaidMembers++;

        }

    });

    document.getElementById("collectAmount").textContent=
    collect.toFixed(2);

    document.getElementById("paidAmount").textContent=
    paid.toFixed(2);

    document.getElementById("remainingAmount").textContent=
    remaining.toFixed(2);

    document.getElementById("paidMembers").textContent=
    paidMembers;

    document.getElementById("unpaidMembers").textContent=
    unpaidMembers;

}

// ===============================
// SEARCH PAYMENT TABLE
// ===============================

function searchPayment(){

    let input=document.getElementById("paymentSearch").value.toLowerCase();

    let rows=document.querySelectorAll("#paymentTable tr");

    rows.forEach(row=>{

        row.style.display=
        row.innerText.toLowerCase().includes(input)
        ? ""
        : "none";

    });

}

// ===============================
// EXPORT CSV
// ===============================

function exportCSV(){

    let csv="No,Month,Member,Previous,Present,Cubic Used,Total Due,Status\n";

    billingData.forEach((item,index)=>{

        csv+=`${index+1},${item.month},${item.member},${item.previous},${item.present},${item.cubicUsed},${item.totalDue},${item.status}\n`;

    });

    const blob=new Blob([csv],{type:"text/csv"});

    const link=document.createElement("a");

    link.href=URL.createObjectURL(blob);

    link.download="BAWASA_Billing.csv";

    link.click();

}