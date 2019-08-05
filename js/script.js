function sendCmd(cmd, data) {

    let xmlhttp = new XMLHttpRequest();
    let url = "http://192.168.1.91";
    let owner = navigator.platform;
    owner = owner.replace(" ", "_");
    let req = {"cmd":cmd, "owner":owner, "data":data}
    xmlhttp.open("POST", url, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify(req));
    
    xmlhttp.onreadystatechange = function () {

        let result = document.getElementById('rslt');
        
        if (xmlhttp.readyState == 3) {
            result.innerHTML = '<h3>Loading...</h3>';
        }

        if (xmlhttp.readyState === 4) {

            if (xmlhttp.status === 200) {
                var json = JSON.parse(xmlhttp.responseText);
                result.innerHTML = getCmd(json);
                console.log(json);
            } else {
                let msg = '<h3>server is not responding</h3>';
                result.innerHTML = msg;
                console.log(msg);
                console.log(xmlhttp.status);
            }

        }
    };
}

function getCmd(obj) {

    cmd    = obj['cmd'];
    render = '<h3>server error</h3>';

    switch(cmd) {
        case 'user':
        render = renderUser(obj);
        break;

        case 'state':
        render = renderState(obj);
        break;
    }

    return render;
}

function renderUser(obj) {

    render = '<h4>user [ <code>'+obj['owner']+'</code> ]</h4>';
    data   = obj['data'];

    render += '<table><tr>';

    for (var prop in data) {
        render += '<tr><td style="height:30px">' + prop + '</td><td style="height:30px">' + data[prop] + '</td></tr>';
    }

    render += '</tr></table>';

    render +='<button type="button" id="start">Start Game</button>';

    return render;
}

function renderState(obj) {

    let chips = ['', 'O', 'X'];

    render = '<h4>Your Chip [ <code id="chip">'+chips[obj['data']['chip']]+'</code> ]</h4>';
    render += '<table><tr>';

    let i = 0
    let field = obj['data']['field']

    if("undefined" === typeof(obj['data']['result'])){
        var hasResult = false;
    } else {
        var hasResult = true;
    }

    for (var key in field) {

        if (hasResult) {
            var cl = '';
        } else {
            if (field[key]) {
                var cl = ' class="inactive"';
            } else {
                var cl = ' class="active"';
            }
        }
    
        render += '<td id = '+ i + cl +' >' + chips[field[key]] + '</td>';
        i++;

        if (i % 3 == 0) {
            render += '</tr><tr>';
        }
    }

    render += '</tr></table>';

    render += '<input type="hidden" id="select" value=null>';
    render +='<button type="button" id="turn" disabled>Turn</button>';

    if (hasResult) {
        render += '<p class="result"><span>result</span> [';

        if(obj['data']['result'] === 0) {
            render += 'losing';
        } else if (obj['data']['result'] === 1) {
            render += 'winning';
        } else if (obj['data']['result'] === 2) {
            render += 'draw';
        }

        render += ']</p>';
        render +='<button type="button" id="finish">Finish</button>';
    }

    

    return render;
}

document.addEventListener('click',function(e){
    if (e.target) {

        if (e.target.id== 'start'){
            sendCmd("start", {});
        }

        if (e.target.className == 'active') {

            let actives = document.getElementsByClassName("active");

            for (var key in actives) {
                active = actives[key];
                active.innerHTML = '';
            }

            let chip = document.getElementById('chip');
            e.target.innerHTML = chip.innerHTML;
            let select = document.getElementById('select');
            select.value = e.target.id;
            document.getElementById("turn").disabled = false;
        }

        if (e.target.id == 'turn') {
            let select = document.getElementById('select');
            let choose = parseInt(select.value);
            sendCmd("move", {"choose": choose});
        }

        if (e.target.id== 'finish'){
            sendCmd("finish", {});
        }

    }
 });

window.addEventListener("DOMContentLoaded", function(event) {
    sendCmd("init", {});
});