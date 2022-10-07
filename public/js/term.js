var allCheck = false;

function checkAll() {
    if(allCheck) {
        allCheck = false;
        for(var i=0;i<2;i++) document.getElementsByName("agreement")[i].checked=false;
    }
    else {
        allCheck = true;
        for(var i=0;i<2;i++) document.getElementsByName("agreement")[i].checked=true;
    }
}

function boxCheck() {
    if(document.getElementsByName("agreement")[1].checked) {
        if(document.getElementsByName("agreement")[0].checked) {
            location.href='signup';
        }
        else {
            alert("서비스 이용약관에 동의해주세요.");
        }
    }
    else {
        alert("개인정보 수집 및 이용에 동의해주세요.");
    }
}