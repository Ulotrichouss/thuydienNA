
$(document).ready(function() {
    $('#minusHT').click(function () {
        let find = $('#water-before');
        let count = parseFloat(find.val());
        number = parseFloat(count-0.1).toFixed(2);
        number = number <= 214 ? 214.00 : number;
        find.val(number);
        find.change();
    });
    $('#plusHT').click(function () {
        let find = $('#water-before');
        let count = parseFloat(find.val());
        number = parseFloat(count+0.1).toFixed(2);
        number = number <= 214 ? 214.00 : number;
        find.val(number);
        find.change();
    });

    $('#minusHS').click(function () {
        let find = $('#water-after');
        let count = parseFloat(find.val());
        number = parseFloat(count-0.1).toFixed(2);
        number = number <= 214 ? 214.00 : number;
        find.val(number);
        find.change();
    });
    $('#plusHS').click(function () {
        let find = $('#water-after');
        let count = parseFloat(find.val());
        number = parseFloat(count+0.1).toFixed(2);
        number = number <= 214 ? 214.00 : number;
        find.val(number);
        find.change();
    });

    $('#minusQH').click(function () {
        let find = $('#q-lake');
        let count = parseFloat(find.val());
        number = parseFloat(count-0.01).toFixed(2);
        number = String(number).charAt(4) && String(number).charAt(5) == 0 ? parseInt(number) : number
        number = number <=0 ? 0 : number
        find.val(number);
        find.change();
    });
    $('#plusQH').click(function () {
        let find = $('#q-lake');
        let count = parseFloat(find.val());
        number = parseFloat(count+0.01).toFixed(2);
        number = String(number).charAt(4) && String(number).charAt(5) == 0 ? parseInt(number) : number
        find.val(number);
        find.change();
    });

    $('#minusQM').click(function () {
        let find = $('#q-run');
        let count = parseFloat(find.val());
        number = parseFloat(count-0.1).toFixed(1);
        number = String(number).charAt(4) == 0 ? parseInt(number) : number
        number = number <=0 ? 0 : number
        find.val(number);
        find.change();
    });
    $('#plusQM').click(function () {
        let find = $('#q-run');
        let count = parseFloat(find.val());
        number = parseFloat(count+0.1).toFixed(1);
        number = String(number).charAt(4) == 0 ? parseInt(number) : number
        find.val(number);
        find.change();
    });

    $('#minusQX').click(function () {
        let find = $('#q-dis');
        let count = parseFloat(find.val());
        number = parseFloat(count-0.01).toFixed(2);
        number = String(number).charAt(4) && String(number).charAt(5) == 0 ? parseInt(number) : number
        number = number <=0 ? 0 : number
        find.val(number);
        find.change();
    });
    $('#plusQX').click(function () {
        let find = $('#q-dis');
        let count = parseFloat(find.val());
        number = parseFloat(count+0.01).toFixed(2);
        number = String(number).charAt(4) && String(number).charAt(5) == 0 ? parseInt(number) : number
        find.val(number);
        find.change();
    });
});