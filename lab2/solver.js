class Solver {
    static obj = {
        adjacencyMatrix: [],
    };

    constructor(adjacencyMatrix) {
        this.obj['adjacencyMatrix'] = adjacencyMatrix;
    }

    // Метод получает на вход матрицу смежностей, решает лабу и возвращает объект с результатами
    static solve(inputMatrix) {
        this.input(inputMatrix);
        this.obj['aInDegree'] = this.getAllAInDegree(this.obj['adjacencyMatrix']);
        // 3. Проверка на наличие контура
        let num = this.obj['aInDegree'][this.obj['aInDegree'].length - 1][0][0]
        let circuitBool = this.checkCircuit(this.obj['aInDegree']);
        if (!Number.isFinite(num) || Number.isNaN(num) || circuitBool) {
            // В данной лабе нет контуров, при появлении остановится
            this.obj['circuit'] = true;
            console.error('circuit');
            return this.obj;
        } else {
            this.obj['reachableMatrix'] = this.getReachableMatrix(this.obj['aInDegree']);
            this.obj['aInDegreeWithSums'] = this.getAllAInDegreeWithSums(this.obj['aInDegree']);
            this.obj['orderElements'] = this.determiningOrderElement(this.obj['aInDegreeWithSums']);
            this.obj['systemTact'] = this.obj['Pij'].length - 1;// 2. Тактность системы
            this.obj['streamInputElements'] = this.definitionOfStreamInputElements(this.obj['aInDegreeWithSums']);
            this.obj['streamOutputElements'] = this.definitionOfStreamOutputElements(this.obj['aInDegreeWithSums']);
            this.obj['danglingVertices'] = this.definitionOfDanglingVertices(this.obj['aInDegreeWithSums']);
            // console.log(this.determinationOfNumberOfPaths(2, this.obj['aInDegree']));
            // console.log(this.getNumberOfPathsBetween2Elements(0,4));
            // console.log(this.getElementsThatFormThis(2));
        }
        return this.obj;
    }

    // Возвращает матрицу достижимости A(Σ)
    static getReachableMatrix(aInDegree) {
        let sumMatrix = JSON.parse(JSON.stringify(aInDegree[1])); // Copy array
        let len = aInDegree[0][0].length;
        for (let a = 2; a < aInDegree.length; a++) {
            for (let i = 0; i < len; i++) {
                for (let j = 0; j < len; j++) {
                    sumMatrix[i][j] += aInDegree[a][i][j];
                }
            }
        }
        return sumMatrix;
    }

    // Возвращает массив с матрицами А в степени лямбда, A^0 - единичная матрица
    static getAllAInDegree(adjacencyMatrix) {
        let aInDegree = [[]];
        for (let i = 0; i < adjacencyMatrix.length; i++) {
            aInDegree[0].push([])
            for (let j = 0; j < adjacencyMatrix.length; j++) {
                aInDegree[0][i][j] = 1;
            }
        }
        aInDegree.push(adjacencyMatrix);
        aInDegree.push(this.matrixMultiplication(adjacencyMatrix, adjacencyMatrix));
        while (!this.equals(aInDegree[aInDegree.length - 1], aInDegree[aInDegree.length - 2])) {
            aInDegree.push(this.matrixMultiplication(aInDegree[aInDegree.length - 1], aInDegree[aInDegree.length - 2]));
        }
        aInDegree.pop();
        return aInDegree;
    }

    // Возвращает матрицы А в степени с суммами по строкам и столбцам(сигма)
    static getAllAInDegreeWithSums(aInDegree) {
        let aInDegreeWithSums = JSON.parse(JSON.stringify(aInDegree));
        aInDegreeWithSums.forEach((matrix) => {
            let columnSum = Array(matrix.length).fill(0);
            for (let i = 0; i < matrix.length; i++) {
                let rowSum = 0;
                for (let j = 0; j < matrix.length; j++) {
                    rowSum += matrix[i][j];
                    columnSum[j] += matrix[i][j];
                }
                matrix[i][matrix.length] = rowSum;
            }
            matrix.push(columnSum);
        })
        return aInDegreeWithSums;
    }

    // 1. Определение порядков элемента
    static determiningOrderElement(aInDegreeWithSums) {
        let Pij = []; // Элементы n-го порядка
        let orderElements = Array(this.obj["verticesCount"]).fill(-1);
        for (let a = 1; a < aInDegreeWithSums.length; a++) {
            let j0 = [], j1 = [],
                A0lastRow = aInDegreeWithSums[a - 1][aInDegreeWithSums[a - 1].length - 1],
                A1lastRow = aInDegreeWithSums[a][aInDegreeWithSums[a].length - 1];
            for (let i = 0; i < A0lastRow.length; i++) {
                if (A0lastRow[i] > 0) j0.push(i);
                if (A1lastRow[i] === 0) j1.push(i);
            }
            let zeroOrderVertices = this.arrayConjunction(j0, j1);
            Pij.push(zeroOrderVertices);
            j0.forEach(e => orderElements[e]++);
        }
        this.obj['Pij'] = Pij;
        return orderElements;
    }

    // 4. Определение входных элементов потока
    static definitionOfStreamInputElements(aInDegreeWithSums) {
        let streamInputElements = [];
        for (let a = 1; a < aInDegreeWithSums.length; a++) {
            let arr = [],
                row = aInDegreeWithSums[a][aInDegreeWithSums[a].length - 1];
            for (let i = 0; i < row.length; i++) {
                if (row[i] === 0) arr.push(i)
            }
            streamInputElements.push(arr);
        }
        return streamInputElements;
    }

    // 5. Определение выходных элементов потока
    static definitionOfStreamOutputElements(aInDegreeWithSums) {
        let streamOutputElements = [];
        for (let a = 1; a < aInDegreeWithSums.length; a++) {
            let arr = [];
            for (let i = 0; i < aInDegreeWithSums[a].length - 1; i++) {
                if (aInDegreeWithSums[a][i][aInDegreeWithSums[a][i].length - 1] === 0) arr.push(i)
            }
            streamOutputElements.push(arr);
        }
        return streamOutputElements;
    }

    // 6. Определение висящих вершин
    static definitionOfDanglingVertices(aInDegreeWithSums) {
        let matrix = aInDegreeWithSums[1]; // λA = 1
        for (let i = 0; i < matrix.length - 1; i++) {
            if (matrix[matrix[i].length - 1][i] === 0 && matrix[i][matrix[i].length - 1] === 0) return i;
        }
        return false;
    }

    // 7. Определение числа путей длинной λ
    static determinationOfNumberOfPaths(from, to, lambdaMatrix) {
        return lambdaMatrix[from][to];
    }

    // 8. Определение всевозможных путей длинной λ
    static getNumberOfPathsBetween2Elements(from, to, reachableMatrix) {
        return reachableMatrix[from][to]
    }

    // 9. Определение элементов участвующих в формировании данного
    static getElementsThatFormThis(element, reachableMatrix) {
        // Возвращает ответ в формате [[формируют элемент],[элемент формирует]]
        if (element > reachableMatrix.length) return false;
        let answer = [[], []]
        for (let i = 0; i < reachableMatrix.length; i++) {
            if (reachableMatrix[i][element] !== 0) answer[0].push(i)
        }
        for (let i = 0; i < reachableMatrix[element].length; i++) {
            if (reachableMatrix[element][i] !== 0) answer[1].push(i)
        }
        return answer;
    }

    // Проверка на контур, возвращает true|false
    static checkCircuit(arrayMatrix) {
        for (let a = 1; a < arrayMatrix.length; a++) {
            for (let i = 0; i < arrayMatrix[a].length; i++) {
                for (let j = 0; j < arrayMatrix[a][i].length; j++) {
                    if (i === j && arrayMatrix[a][i][j] !== 0) return true;
                }
            }
        }
        return false;
    }

    // Перемножение матриц
    static matrixMultiplication(A, B) {
        let result = [];
        let lenI = B[0].length;
        let lenJ = A.length;
        if (lenI !== lenJ) return false;
        for (let i = 0; i < lenJ; i++) {
            result.push([]);
        }
        for (let i = 0; i < lenJ; i++) {
            for (let j = 0; j < lenI; j++) {
                result[i][j] = 0;
                for (let k = 0; k < B.length; k++) {
                    result[i][j] += A[i][k] * B[k][j];
                }
            }
        }
        return result;
    }

    // Валидация инпута и присвоение матрицы в this
    static input(adjacencyMatrix) {
        if (Array.isArray(adjacencyMatrix)) {
            this.obj = {};
            this.obj['adjacencyMatrix'] = adjacencyMatrix;
            this.obj['verticesCount'] = adjacencyMatrix.length
            // this.obj['adjacencyMatrix'] = JSON.parse(JSON.stringify(adjacencyMatrix)); // Copy
        } else throw new Error('input is not array')
    }

    // Глубокое сравнение массивов и объектов
    static equals(a, b) {
        return JSON.stringify(a) === JSON.stringify(b)
    };

    // логическое И для массивов
    static arrayConjunction(arr1, arr2) {
        let newArr = [];
        arr1.forEach((el) => {
            if (arr2.includes(el)) newArr.push(el);
        });
        return newArr.sort();
    };
}

export default Solver;
// module.exports = Solver; // Для тестов на jest