const getFacingOperationWithParametersTerm = function (arg) {
    let withParameters = `of ${arg.mlSurfaceArea} ${getUnit('area')}, 
    dimensions of ${arg.mlLength} ${getUnit('length')} by ${arg.mlWidth} ${getUnit('length')}, 
    a perimeter of ${arg.mlPerimeter} ${getUnit('length')},`;
    withParameters = `${withParameters} ${arg.mlDepthPerCut > 0 ? '' : 'and'} a stock thickness of ${arg.mlStockThickness} ${getUnit('length')}`;
    if (arg.mlDepthPerCut > 0) {
        withParameters = `${withParameters}, and a depth per cut of ${arg.mlDepthPerCut} ${getUnit('length')}`;
    }

    return withParameters;
};

const getPocketingOperationWithParametersTerm = function (arg) {
    let withParameters = `of ${arg.mlSurfaceArea} ${getUnit('area')}, a height of ${arg.mlStockThickness} ${getUnit('length')}, 
            a cut volume of ${arg.mlCutVolume} ${getUnit('volume')}, ${arg.mlNumberOfEdges} edges, 
            dimensions of ${arg.mlLength} ${getUnit('length')} by ${arg.mlWidth} ${getUnit('length')},`;
    if (arg.mlSmallestRadius !== Infinity) {
        withParameters = `${withParameters} a smallest internal radius of ${arg.mlSmallestRadius} ${getUnit('length')},`;
    }
    if (arg.mlDepthPerCut > 0) {
        withParameters = `${withParameters} a perimeter of ${arg.mlPerimeter} ${getUnit('length')}, and a depth per cut of ${arg.mlDepthPerCut} ${getUnit('length')}`;
    } else {
        withParameters = `${withParameters} and a perimeter of ${arg.mlPerimeter} ${getUnit('length')}`;
    }

    return withParameters;
};

const getContouringOperationWithParametersTerm = function (arg) {
    let withParameters = `of ${arg.mlNumberOfFaces} walls, with a depth of ${arg.mlDepth} ${getUnit('length')},`;
    if (arg.mlSmallestRadius !== Infinity) {
        withParameters = `${withParameters} dimensions of ${arg.mlLength} ${getUnit('length')} by ${arg.mlWidth} ${getUnit('length')}, 
        and a smallest internal radius of ${arg.mlSmallestRadius} ${getUnit('length')}`;
    } else {
        withParameters = `${withParameters} and dimensions of ${arg.mlLength} ${getUnit('length')} by ${arg.mlWidth} ${getUnit('length')}`;
    }

    return withParameters;
};

/* eslint-enable object-curly-newline, object-curly-newline */
const generateChatPrompt = function (arg) {
    let doWhat = 'machine something';
    let withParameters = 'of certain dimensions';
    let pleaseSpecifically = 'all parameters';
    const pleaseSpecificallyDiaFluteLnOverLn = 'the diameter, flute length, and overall length';
    console.log(arg);
    switch (arg.operationType) {
        case 'FacingOperation':
            doWhat = arg.mlNumberOfFaces === 1 ? 'mill a face' : `mill ${arg.mlNumberOfFaces} faces`;

            withParameters = getFacingOperationWithParametersTerm(arg);

            pleaseSpecifically = pleaseSpecificallyDiaFluteLnOverLn;

            break;

        case 'PocketingOperation':
            doWhat = arg.mlNumberOfFaces === 1 ? 'mill a pocket' : `mill ${arg.mlNumberOfFaces} pockets`;

            withParameters = getPocketingOperationWithParametersTerm(arg);

            pleaseSpecifically = pleaseSpecificallyDiaFluteLnOverLn;

            break;

        case 'ContouringOperation':
            doWhat = 'mill a contour';

            withParameters = getContouringOperationWithParametersTerm(arg);

            pleaseSpecifically = pleaseSpecificallyDiaFluteLnOverLn;

            break;

        case 'StdDrillingOperation':
            doWhat = arg.mlNumberOfFaces === 1 ? 'drill a hole' : `drill ${arg.mlNumberOfFaces} holes`;

            withParameters = `with a radius of ${arg.mlSmallestRadius} ${getUnit('length')} and a depth of ${arg.mlDepth} ${getUnit('length')}`;

            pleaseSpecifically = 'the diameter, flute length, overall length, and point angle';

            break;

        default:
    }

    return `Which tool of what dimensions would you pick to ${doWhat} ${withParameters}? In your response make sure to include ${pleaseSpecifically}.`;
};

const generateChatOutput = function () {
    /* eslint-disable quotes */
    return [{
        "key": "TlDiameterBuilder",
        "type": "number",
        "description": "What is the value of the diameter of the suggested tool in the same unit as the feature?"
    }, {
        "key": "TlFluteLnBuilder",
        "type": "number",
        "description": "What is the value of the flute length of the suggested tool in the same unit as the feature?"
    }, {
        "key": "TlHeightBuilder",
        "type": "number",
        "description": "What is the value of the overall length of the suggested tool in the same unit as the feature?"
    }, {
        "key": "toolType",
        "type": "string",
        "description": "What is the type of the suggested tool? Can either be \"EndMillTool\", \"ChamferMillTool\", \"FaceMillTool\", or \"DrillTool\"."
    }];
    /* eslint-enable quotes */
};

const getChatAnswer = async function (query, output) {
    const config = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };
    const body = {
        query: query,
        output: output
    };

    return new Promise((resolve) => {
        camliteInProgress(true);
        $http.post('/api/chat/', body, config).then((httpResponse) => {
            camliteInProgress(false);
            resolve(httpResponse.data);
        }).catch((error) => {
            logConsole(`FAILURE: SEND_CHAT_ => ${error.message}`);
            camliteInProgress(false);
            resolve(undefined);
        });
    });
};

const getUnit = function (type) {
    const unitSystem = 'Inches';

    switch (type) {
        case 'length':
            return unitSystem === 'Inches' ? 'in' : 'mm';
        case 'area':
            return unitSystem === 'Inches' ? 'in2' : 'mm2';
        case 'volume':
            return unitSystem === 'Inches' ? 'in3' : 'mm3';
        default:
            return unitSystem;
    }
};

const generateQuery = function () {
    const query = generateChatPrompt({
        operationType: 'ContouringOperation',
        mlNumberOfFaces: 2, mlNumberOfEdges: 12,
        mlSurfaceArea: 10, mlPerimeter: 14, mlLength: 4, mlWidth: 1.5, mlDepth: 1,
        mlSmallestRadius: 0.2,
        mlStockThickness: 1.5,
        mlDepthPerCut: 0.2,
        mlCutVolume: 6
    });

    console.log(query);
}
generateQuery();