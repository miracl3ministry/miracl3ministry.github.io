"use strict";
import Solver from './solver.js';
import solver from "./solver.js";

/*
* Реализация лабораторной работы №2
* Осторожно дальше идет немного говнокода
* */

class HtmlInterface {
    // Класс для создания интерфейса на html и получения входных данных
    static instance;

    constructor() {
        if (HtmlInterface.instance) { // Проверяем существует ли данный класс в одном экземпляре
            return HtmlInterface.instance;
        }
        this.verticesCount = 0;
        this.edges = [];
        this.adjacencyMatrix = [];
        this.incidenceMatrix = [];

        this.Graph = Dracula.Graph;
        this.Renderer = Dracula.Renderer.Raphael;
        this.Layout = Dracula.Layout.Spring;
        this.g = new this.Graph();

        this.render = (r, n) => { // For custom elements
            // let label = r.text(0, 30, n.label).attr({ opacity: 0 });
            let set = r
                .set()
                .push(r.rect(n.point[0] - 30, n.point[1] - 13, 62, 86).attr({
                    fill: "#fa8",
                    "stroke-width": 2,
                    r: "9px"
                }))
                .push(r.text(n.point[0], n.point[1] + 30, n.label).attr({"font-size": "20px"}));
            console.log("set:", set);
            return set;
        };

        this.drawFirstScreen();
    }

    drawFirstScreen() {
        this.g.addEdge("1", "2");
        this.g.addEdge("1", "3");
        this.g.addEdge("3", "4");
        this.g.addEdge("3", "5");
        this.g.addEdge("4", "2");
        this.g.addEdge("5", "1");
        this.g.addEdge("5", "2");

        this.layouter = new this.Layout(this.g);
        this.layouter.layout();

        let width = document.getElementById("div").clientWidth;
        let height = 500;

        this.renderer = new this.Renderer("#div", this.g, width, height);
        this.renderer.draw();
    };

    // Вызывается при нажатии на кнопку "очистить"
    checkUpAndStart() {
        // Костыль, нету this
        if (htmlInterface.incidenceMatrix.length !== 0) {
            htmlInterface.verticesCount = htmlInterface.incidenceMatrix.length;
            htmlInterface.drawAdjacencyMatrix();
            htmlInterface.createsIncidenceMatrix();
            htmlInterface.drawIncidenceMatrix();
        } else {
            htmlInterface.drawAdjacencyMatrix();
        }
    };

    addButtonListeners() {
        // Инпут с количеством вершин и создание инпутов для матрицы
        document.getElementById("verticesCount").addEventListener("change", (e) => {
            let count = e.target.valueAsNumber;
            this.verticesCount = count;
            if (count > 0 && count <= 20) {
                // создает пустой двумерный массив для матрицы смежностей
                this.adjacencyMatrix = [];
                for (let i = 0; i < count; i++) {
                    let row = [];
                    for (let j = 0; j < count; j++) row.push(0);
                    this.adjacencyMatrix.push(row);
                }
                // создает форму ввода матрицы
                e.target.style.outline = "none";
                this.createInputsForAdjacencyMatrix(count);
            } else {
                e.target.style.outline = "1px solid red";
            }
        });
        // Clear button
        document.getElementById("clear_btn").addEventListener("click", this.clear);
        // Draw vertices button
        document.getElementById("drawVertices_btn").addEventListener("click", this.checkUpAndStart);
        // For tests
        document.getElementById("output").addEventListener("click", this.output);
        document.getElementById("inputFromAlert").addEventListener("click", this.inputFromAlert);
    };

    drawGraphsIn(htmlElement) { // document.getElementById("div")
        this.layouter = new this.Layout(this.g);
        this.layouter.layout();

        let width = htmlElement.clientWidth;
        let height = 500;

        this.renderer = new this.Renderer(htmlElement, this.g, width, height);
        this.renderer.draw();
    };

    // Очищает графы и div
    clear() {
        // Костыль, из кнопок нет this
        document.getElementById("div").innerText = "";
        htmlInterface.g = new htmlInterface.Graph();
    };

    // Обновляет матрицу смежностей
    updateAdjacencyMatrix(e) {
        if (e.target.valueAsNumber > 0) e.target.valueAsNumber = 1;
        else e.target.valueAsNumber = 0;
        // Костыль, this хз куда показывает
        htmlInterface.adjacencyMatrix[e.target.dataset.i][e.target.dataset.j] = e.target.valueAsNumber;
        document.querySelector('.adjacencyMatrixOut').innerText = htmlInterface.arrayToString(htmlInterface.adjacencyMatrix);

        htmlInterface.checkUpAndStart();
        htmlInterface.createInputsForIncidenceMatrix();
    };

    // Создает массив со всеми гранями
    createInputsForIncidenceMatrix() {
        let edges = [],
            edgesStringArr = [];
        let adjacencyMatrix = this.adjacencyMatrix;
        this.edges.forEach((e) => {
            edges.push([e.from, e.to]);
            edgesStringArr.push([e.from, e.to].toString());
        });
        // добавляем инпуты для матрицы инцидентности и заполняем их
        let table = document.createElement("table");
        let tableHeader = document.createElement("tr");
        let th = document.createElement("th");
        this.incidenceMatrix = [];
        th.innerText = "i\\j";
        tableHeader.append(th);
        table.append(tableHeader);
        for (let j = 0; j < edges.length; j++) {
            let Jth = document.createElement("th");
            Jth.innerText = j + 1;
            tableHeader.append(Jth);
        }
        for (let i = 0; i < this.verticesCount; i++) {
            let tr = document.createElement("tr");
            let Ith = document.createElement("th");
            Ith.innerText = i + 1;
            tr.append(Ith);
            let incidenceMatrixRow = [];
            for (let j = 0; j < edges.length; j++) {
                let td = document.createElement("td");
                let input = document.createElement("input");
                if (edges[j][0] === i) {
                    input.classList.add("incidenceMatrix__input");
                    input.type = "number";
                    input.min = -1;
                    input.max = 1;
                    input.step = 2;
                    input.value = 1;
                    input.dataset.i = i;
                    input.dataset.j = j;
                    incidenceMatrixRow.push(1);
                } else if (edges[j][1] === i) {
                    input.classList.add("incidenceMatrix__input");
                    input.type = "number";
                    input.min = -1;
                    input.max = 1;
                    input.step = 2;
                    input.value = -1;
                    input.dataset.i = i;
                    input.dataset.j = j;
                    incidenceMatrixRow.push(-1);
                } else {
                    input.type = "number";
                    input.min = -1;
                    input.max = 1;
                    input.value = 0;
                    input.disabled = true;
                    incidenceMatrixRow.push(0);
                }
                input.addEventListener("change", this.updateIncidenceMatrix);
                td.append(input);
                tr.append(td);
            }
            this.incidenceMatrix.push(incidenceMatrixRow);
            table.append(tr);
        }
        document.getElementById("incidenceMatrix__inputs").innerText = "";
        document.getElementById("incidenceMatrix__inputs").append(table);
    };

    // Обновляет матрицу инцидентности
    updateIncidenceMatrix(e) {
        let elChangeValue = document.querySelectorAll(`.incidenceMatrix__input[data-j="${e.target.dataset.j}"]`);
        if (elChangeValue.length !== 2) throw new Error(".incidenceMatrix__input error");
        if (elChangeValue[0] === e.target) {
            if (e.target.valueAsNumber > 0) e.target.valueAsNumber = 1;
            else e.target.valueAsNumber = -1;
            let num = e.target.valueAsNumber;
            elChangeValue[1].valueAsNumber = num * -1;
            htmlInterface.incidenceMatrix[e.target.dataset.i][e.target.dataset.j] = num;
            htmlInterface.incidenceMatrix[elChangeValue[1].dataset.i][elChangeValue[1].dataset.j] = num * -1;
        } else {
            if (e.target.valueAsNumber > 0) e.target.valueAsNumber = 1;
            else e.target.valueAsNumber = -1;
            let num = e.target.valueAsNumber;
            elChangeValue[0].valueAsNumber = num * -1;
            htmlInterface.incidenceMatrix[e.target.dataset.i][e.target.dataset.j] = num;
            htmlInterface.incidenceMatrix[elChangeValue[0].dataset.i][elChangeValue[0].dataset.j] = -1;
        }
        document.querySelector(".incidenceMatrixOut").innerText = htmlInterface.arrayToString(htmlInterface.incidenceMatrix);
        htmlInterface.drawIncidenceMatrix();
    };

    // Рисует графы из матрицы смежностей
    drawAdjacencyMatrix() {
        this.edges = [];
        let adjacencyMatrix = this.adjacencyMatrix;
        if (adjacencyMatrix) {
            this.clear();
            // цикл по adjacencyMatrix
            for (let i = 0; i < adjacencyMatrix.length; i++) {
                let edges = [];
                for (let j = 0; j < adjacencyMatrix[i].length; j++) {
                    if (adjacencyMatrix[i][j]) {
                        this.edges.push({from: i, to: j});
                        edges.push(j);
                    }
                }
                // отрисовка граней и вершин
                if (edges.length === 0) {
                    this.g.addNode((i + 1).toString());
                } else {
                    edges.forEach((e) => {
                        this.g.addEdge((i + 1).toString(), (e + 1).toString());
                    });
                }
            }
            this.drawGraphsIn(document.getElementById("div"));
        } else console.error("adjacency matrix: ", adjacencyMatrix);
    };

    // Проверка направления графа по матрице инцидентности
    drawIncidenceMatrix() {
        // рисует графы из this.edges
        this.clear();
        for (let i = 0; i < this.edges.length; i++) {
            let style = {
                "directed": true,
                "font-size": '18px',
                "fill-opacity": '1',
                "label": (i + 1).toString()
            };
            this.g.addEdge((this.edges[i].from + 1).toString(), (this.edges[i].to + 1).toString(), {
                style: style, // баг с пропадающими стрелками после добавления стиля, баг с label
            });
        }
        this.drawGraphsIn(document.getElementById("div"));
    };

    // Добавляет инпуты для матрицы смежностей
    createInputsForAdjacencyMatrix(count) {
        let table = document.createElement("table");
        let tableHeader = document.createElement("tr");
        let th = document.createElement("th");
        th.innerText = "i\\j";
        tableHeader.append(th);
        table.append(tableHeader);
        for (let i = 0; i < count; i++) {
            let tr = document.createElement("tr");
            let Ith = document.createElement("th");
            let Jth = document.createElement("th");
            Ith.innerText = i + 1;
            Jth.innerText = i + 1;
            tableHeader.append(Jth);
            tr.append(Ith);
            for (let j = 0; j < count; j++) {
                let td = document.createElement("td");
                let input = document.createElement("input");
                input.classList.add("adjacencyMatrix__input");
                input.type = "number";
                input.min = 0;
                input.max = 1;
                input.value = 0;
                input.dataset.i = i;
                input.dataset.j = j;
                input.addEventListener("change", this.updateAdjacencyMatrix);
                td.append(input);
                tr.append(td);
            }
            table.append(tr);
        }
        document.getElementById("adjacencyMatrix__inputs").innerText = "";
        document.getElementById("adjacencyMatrix__inputs").append(table);
    };

    inputFromAlert() {
        let a = prompt("Введите матрицу в формате \n[...]\n[...]\n[...]"),
            arr = [];
        a = a.replace(/[\n ]/gi, "").replace(/\r/gi, ";").split(";");
        if (!Array.isArray(a)) throw new Error("input not array");
        else {
            a.forEach((e) => {
                let b = e.split(",");
                for (let i = 0; i < b.length; i++) {
                    b[i] = Number(b[i].replace(/[^0-9]/gi, ""));
                }
                arr.push(b);
            });
        }
        htmlInterface.adjacencyMatrix = arr;
        htmlInterface.incidenceMatrix = [];
        htmlInterface.edges = [];
        htmlInterface.checkUpAndStartFromInput();
    };

    checkUpAndStartFromInput() {
        if (this.adjacencyMatrix.length !== 0) {
            this.verticesCount = this.adjacencyMatrix.length;
            document.getElementById("verticesCount").valueAsNumber = this.verticesCount;
            this.clear();
            this.updateAdjacencyMatrixFromInput();
            this.createsIncidenceMatrix();
            this.createInputsForIncidenceMatrix();
            this.drawIncidenceMatrix();
        }
    };

    // Обновляет матрицу смежностей после текстового ввода
    updateAdjacencyMatrixFromInput() {
        this.createInputsForAdjacencyMatrix(this.adjacencyMatrix.length);
        let inputs = document.getElementById("adjacencyMatrix__inputs");
        let len = this.verticesCount;
        for (let i = 0; i < len; i++) {
            for (let j = 0; j < len; j++) {
                inputs.querySelector(`[data-i="${i}"][data-j="${j}"]`).valueAsNumber = this.adjacencyMatrix[i][j];
            }
        }
        document.querySelector(".adjacencyMatrixOut").innerText = this.arrayToString(this.adjacencyMatrix);
    };

    // Создает массив матрицы инциденций
    createsIncidenceMatrix() {
        let adjacencyMatrix = this.adjacencyMatrix;
        let edges = [], edgesStringArr = [];
        for (let i = 0; i < adjacencyMatrix.length; i++) {
            for (let j = 0; j < adjacencyMatrix[i].length; j++) {
                if (adjacencyMatrix[i][j]) {
                    this.edges.push({from: i, to: j});
                    edges.push([i, j]);
                    edgesStringArr.push([i, j].toString());
                }
            }
        }
        this.incidenceMatrix = [];
        for (let i = 0; i < edges.length; i++) {
            let incidenceMatrixRow = [];
            for (let j = 0; j < edges.length; j++) {
                if (edges[j][0] === i) {
                    incidenceMatrixRow.push(1);
                } else if (edges[j][1] === i) {
                    incidenceMatrixRow.push(-1);
                } else {
                    incidenceMatrixRow.push(0);
                }
            }
            this.incidenceMatrix.push(incidenceMatrixRow);
        }
    };

    // Вывод результатов. Очень длинный метод, лучше разбить на мелкие потом
    output() {
        // Achtung, attention: все отсчеты и индексы начинаются с 0!
        let adjacencyMatrix = htmlInterface.adjacencyMatrix;
        if (adjacencyMatrix.length > 2) {
            document.querySelector(".out1").innerHTML = "";
            document.querySelector(".out2").innerHTML = "";
            let answer = Solver.solve(adjacencyMatrix);
            if (!answer['circuit']) {
                htmlInterface.outputAdjacencyMatrix(document.querySelector(".out1"), answer['aInDegreeWithSums']);
                let reachableMatrixSums = Solver.getAllAInDegreeWithSums([answer['reachableMatrix']]);
                htmlInterface.outputReachableMatrix(document.querySelector(".out2"), reachableMatrixSums[0]);
                htmlInterface.outputSystemProperties(document.querySelector(".out2"), answer);
            } else {
                document.querySelector(".out2").append("3. Обнаружен контур");
            }
        }
    };

    // Вывод матриц смежности
    outputAdjacencyMatrix(outputElement, matrixArray) {
        outputElement.innerText = 'Матрицы смежностей А\n';
        for (let i = 0; i < matrixArray.length; i++) {
            let span = document.createElement('span');
            let sup = document.createElement('sup');
            sup.innerText = i.toString();
            span.innerText = `A`;
            span.append(sup);
            let table = htmlInterface.matrixToHTMLTable(matrixArray[i], 'σ');
            table.classList.add('table-with-borders', 'w-100');
            // table.lastChild.appendChild(document.createElement("td"));
            outputElement.append(span, table);
        }
    }

    // Вывод матрицы достижимости
    outputReachableMatrix(outputElement, matrix) {
        outputElement.innerText = 'Матрица достижимости\n';
        let reachableMatrixTable = htmlInterface.matrixToHTMLTable(matrix, 'σ');
        reachableMatrixTable.classList.add('table-with-borders2', 'w-100');
        let span = document.createElement('span');
        span.innerText = `A(Σ) = `;
        outputElement.append(span, reachableMatrixTable);
    }

    // Вывод свойств
    outputSystemProperties(outputElement, answer) {
        this.outputSystemProperty1(outputElement, answer); // 1
        outputElement.append(`2. Определение «тактности» системы N=${answer['systemTact']}`);
        outputElement.append(document.createElement('br'));
        outputElement.append(`3. Наличие контура: ${answer['danglingVertices'] ? "Есть" : "Нету"}`);
        outputElement.append(document.createElement('br'));
        outputElement.append(`4. Определение входных элементов потока ${answer['streamInputElements'][0].map(e => "X" + (e + 1))}`);
        outputElement.append(document.createElement('br'));
        outputElement.append(`5. Определение выходных элементов потока ${answer['streamOutputElements'][0].map(e => "X" + (e + 1))}`);
        outputElement.append(document.createElement('br'));
        outputElement.append(`6. Определение висящих вершин: ${(answer['danglingVertices']) ? answer['danglingVertices'] : "Нету"}`);
        outputElement.append(document.createElement('br'));
        this.outputSystemProperty7(outputElement, answer); // 7
        this.outputSystemProperty8(outputElement, answer); // 8
        this.outputSystemProperty9(outputElement, answer); // 9
    }

    // 1: Определение порядка элементов.
    outputSystemProperty1(outputElement, answer) {
        let p = document.createElement('p');
        outputElement.append("1. Определение порядков элемента\r\n");
        for (let i = 0; i < answer['Pij'].length; i++) {
            p.innerText += `π = ${i} вершины X: ${answer['Pij'][i].map(e => "X" + (e + 1))}\r\n`;
            outputElement.append(p);
        }
        let orderTable = htmlInterface.matrixToHTMLTable([answer['orderElements']]);
        orderTable.classList.add('table-with-borders2', 'w-100');
        orderTable.querySelector("th").innerText = "j";
        orderTable.querySelector("tr:last-child th").innerText = "π";
        outputElement.append(orderTable);
    }

    // 7: Определение числа путей длиной λ
    outputSystemProperty7(outputElement, answer) {
        function getAnswer(from, to, lambda, span) {
            let paths = Solver.determinationOfNumberOfPaths(from - 1, to - 1, answer['aInDegree'][lambda]),
                str = 'пути';
            if (paths % 10 > 4 || paths % 10 <= 0
                || (paths % 100 > 10 && paths % 100 < 20)
                || (paths > 4 && paths < 20)
                || paths === undefined) str = 'путей';
            else if (paths % 10 === 1) str = 'путь';
            span.innerText = `Существует ${paths} ${str} длинной ${lambda}`;
        }

        let from = 1,
            to = answer['adjacencyMatrix'].length,
            lambda = 2,
            span = document.createElement('span');
        outputElement.append(`7. Определение числа путей длиной λ`, document.createElement('br'), `От`);
        let inputFrom = this.createInputNumberElement(1, answer['adjacencyMatrix'].length, "form", 1);
        inputFrom.onchange = e => {
            from = e.target.valueAsNumber;
            getAnswer(from, to, lambda, span);
        }
        outputElement.append(inputFrom, ' до');
        let inputTo = this.createInputNumberElement(1, answer['adjacencyMatrix'].length, "to", answer['adjacencyMatrix'].length);
        inputTo.onchange = e => {
            to = e.target.valueAsNumber;
            getAnswer(from, to, lambda, span);
        }
        outputElement.append(inputTo, ' λ =');
        let inputLambda = this.createInputNumberElement(1, 1000, "λ = ", 2);
        inputLambda.onchange = e => {
            lambda = e.target.valueAsNumber;
            getAnswer(from, to, lambda, span);
        }
        getAnswer(from, to, lambda, span);
        outputElement.append(inputLambda, span, document.createElement('br'));
    }

    // 8: Определение всевозможных путей между двумя элементами
    outputSystemProperty8(outputElement, answer) {
        function getAnswer(from, to, span) {
            let paths = Solver.getNumberOfPathsBetween2Elements(from - 1, to - 1, answer['reachableMatrix']),
                str = 'различных пути';
            if (paths % 10 > 4 || paths % 10 <= 0
                || (paths % 100 > 10 && paths % 100 < 20)
                || (paths > 4 && paths < 20)
                || paths === undefined) str = 'различных путей';
            else if (paths % 100 === 1) str = 'различный путь';
            span.innerText = `существует ${paths} ${str}`;
        }

        let from = 1,
            to = answer['adjacencyMatrix'].length,
            span = document.createElement('span'),
            inputFrom = this.createInputNumberElement(1, answer['adjacencyMatrix'].length, "from", 1),
            inputTo = this.createInputNumberElement(1, answer['adjacencyMatrix'].length, "to", answer['adjacencyMatrix'].length);
        outputElement.append(`8. Определение всевозможных путей между двумя элементами`, document.createElement('br'));
        inputFrom.onchange = e => {
            from = e.target.valueAsNumber;
            getAnswer(from, to, span);
        }
        inputTo.onchange = (e) => {
            to = e.target.valueAsNumber;
            getAnswer(from, to, span)
        }
        getAnswer(from, to, span)
        outputElement.append("От ", inputFrom, "до ", inputTo, span, document.createElement('br'));
    }

    // 9: Определение всех элементов, участвующих в формировании данного
    outputSystemProperty9(outputElement, answer) {
        let span = document.createElement('span'),
            input = this.createInputNumberElement(1, answer['reachableMatrix'].length);
        input.onchange = (e) => {
            let ans = Solver.getElementsThatFormThis(e.target.valueAsNumber - 1, answer['reachableMatrix']),
                str = "участвуют";
            if (ans[0].length % 10 > 4 || ans[0].length % 10 <= 0
                || (ans[0].length % 100 > 10 && ans[0].length % 100 < 20)
                || (ans[0].length > 4 && ans[0].length < 20)) str = 'участвуют';
            else if (ans[0].length % 100 === 1) str = 'участвует';
            span.innerText = `(${ans[0].map(e => ++e)}) ${str} в формировании ${e.target.valueAsNumber}
                ${e.target.valueAsNumber} участвует в формировании (${ans[1].map(e => ++e)})`;
        }
        outputElement.append(`9. Определение всех элементов, участвующих в формировании данного`, input, span);
    }

    createInputNumberElement(min, max, placeholder, value = 0) {
        let input = document.createElement('input');
        input.classList.add("incidenceMatrix__input");
        input.type = "number";
        input.min = min;
        input.max = max;
        if (placeholder) input.placeholder = placeholder;
        if (value) input.value = Number(value);
        return input;
    }

    matrixToHTMLTable(arr, lastWordInNames = false) {
        let table = document.createElement("table");
        let tableHeaderRow = document.createElement("tr");
        let th = document.createElement("th");
        // Header или первая строка таблицы
        th.innerText = "i\\j";
        tableHeaderRow.append(th);
        for (let i = 0; i < arr[0].length; i++) {
            let thJ = document.createElement('th');
            thJ.innerText = (i === arr[0].length - 1 && lastWordInNames !== false) ? lastWordInNames : (i + 1).toString();
            tableHeaderRow.append(thJ);
        }
        table.append(tableHeaderRow);
        // Тело таблицы
        for (let i = 0; i < arr.length; i++) {
            let tr = document.createElement("tr");
            let thI = document.createElement("th");
            thI.innerText = (i === arr.length - 1 && lastWordInNames !== false) ? lastWordInNames : (i + 1).toString();
            tr.append(thI);
            for (let j = 0; j < arr[i].length; j++) {
                let td = document.createElement('td');
                td.innerText = "\t" + arr[i][j] + "\t";
                tr.append(td);
            }
            table.append(tr);
        }
        return table;
    }

    arrayToString(arr) {
        let str = "";
        for (let i = 0; i < arr.length; i++) {
            str += "[" + arr[i].toString() + "]" + "\n";
        }
        return str;
    };
}

let htmlInterface = new HtmlInterface();
htmlInterface.addButtonListeners()