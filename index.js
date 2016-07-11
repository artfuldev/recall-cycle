"use strict";
require("babel-polyfill");
var xstream_1 = require('xstream');
;
var delay_1 = require('xstream/extra/delay');
var xstream_run_1 = require('@cycle/xstream-run');
var dom_1 = require('@cycle/dom');
var immutable_1 = require('immutable');
function intent(_a) {
    var dom = _a.dom;
    var newGame$ = dom
        .select('.new')
        .events('click')
        .map(function (ev) {
        ev.preventDefault();
        return true;
    })
        .startWith(true);
    var reset$ = dom
        .select('.reset')
        .events('click')
        .map(function (ev) {
        ev.preventDefault();
        return true;
    });
    var selectCell$ = dom
        .select('.cell span')
        .events('click')
        .map(function (ev) {
        ev.preventDefault();
        return parseInt(ev.target.parentElement.attributes['data-index'].value);
    });
    return {
        newGame$: newGame$,
        reset$: reset$,
        selectCell$: selectCell$
    };
}
function reducers(actions) {
    var puzzleReducer$ = actions.newGame$
        .mapTo(function (state) {
        var puzzle = [];
        var maxSize = 9;
        for (var i = 0; i < maxSize; i++) {
            var nextNumber = Math.floor(Math.random() * 25);
            while (puzzle.indexOf(nextNumber) !== -1)
                nextNumber = Math.floor(Math.random() * 25);
            puzzle.push(nextNumber);
        }
        return state.set('puzzle', puzzle);
    });
    var allowedReducer$ = xstream_1.default.merge(actions.newGame$
        .mapTo(function (state) { return state.set('allowed', false); }), actions.newGame$
        .compose(delay_1.default(4000))
        .mapTo(function (state) { return state.set('allowed', true); }), actions.selectCell$
        .mapTo(function (state) {
        var selected = state.get('selected') || [];
        return selected.length === 9
            ? state.set('allowed', false)
            : state;
    }));
    var selectedReducer$ = xstream_1.default.merge(actions.newGame$
        .mapTo(function (state) { return state.set('selected', []); }), actions.reset$
        .mapTo(function (state) {
        var allowed = state.get('allowed');
        return allowed
            ? state.set('selected', [])
            : state;
    }), actions.selectCell$
        .map(function (clicked) {
        return function (state) {
            var allowed = state.get('allowed');
            if (!allowed)
                return state;
            var selected = state.get('selected') || [];
            var index = selected.indexOf(clicked);
            if (index === -1)
                return state.set('selected', selected.concat(clicked));
            else
                return state.set('selected', selected.filter(function (x) { return x != clicked; }));
        };
    }));
    var scoreReducer$ = actions.selectCell$
        .mapTo(function (state) {
        var over = state.get('over');
        if (over)
            return state;
        var selected = state.get('selected') || [];
        if (selected.length !== 9)
            return state;
        var puzzle = state.get('puzzle') || [];
        var won = selected.every(function (s) { return puzzle.indexOf(s) !== -1; });
        var score = state.get('score') || 0;
        return won
            ? state.set('score', score + 1)
            : state;
    });
    var overReducer$ = xstream_1.default.merge(actions.newGame$
        .mapTo(function (state) { return state.set('over', false); }), actions.selectCell$
        .mapTo(function (state) {
        var selected = state.get('selected') || [];
        return selected.length === 9
            ? state.set('over', true)
            : state;
    }));
    var resultReducer$ = xstream_1.default.merge(actions.newGame$
        .mapTo(function (state) { return state.set('result', null); }), actions.selectCell$
        .mapTo(function (state) {
        var selected = state.get('selected') || [];
        var puzzle = state.get('puzzle') || [];
        var result = {
            correct: selected.filter(function (s) { return puzzle.indexOf(s) !== -1; }),
            wrong: selected.filter(function (s) { return puzzle.indexOf(s) === -1; }),
            missed: puzzle.filter(function (p) { return selected.indexOf(p) === -1; })
        };
        return state.set('result', result);
    }));
    return xstream_1.default.merge(puzzleReducer$, allowedReducer$, selectedReducer$, scoreReducer$, overReducer$, resultReducer$);
}
function model(actions) {
    var grid = [];
    for (var i = 0; i < 25; i++)
        grid.push(i);
    var reducer$ = reducers(actions);
    var initialState = immutable_1.default.Map({
        grid: grid,
        puzzle: [],
        allowed: false,
        selected: [],
        over: false,
        score: 0,
        result: null
    });
    var state$ = reducer$.fold(function (next, reducer) { return reducer(next); }, initialState);
    return state$;
}
function view(state$) {
    var vtree$ = state$.map(function (state) {
        var grid = state.get('grid');
        var allowed = state.get('allowed');
        var puzzle = state.get('puzzle');
        var selected = state.get('selected');
        var score = state.get('score');
        var over = state.get('over');
        var result = state.get('result') || {};
        var correct = result.correct;
        var wrong = result.wrong;
        var missed = result.missed;
        return dom_1.div('#root', [
            dom_1.div('.container', [
                dom_1.div('.title.bar', [
                    dom_1.h1(['Recall']),
                    dom_1.ul('.actions', [
                        dom_1.li([dom_1.a('.new', 'New')]),
                        dom_1.li([dom_1.a('.reset', 'Reset')]),
                    ])
                ]),
                dom_1.div('.before.grid', [
                    dom_1.p(['Click on the nine tiles you see to win! Score: ' + score])
                ]),
                dom_1.div('.panel', [
                    dom_1.div('.grid', grid.map(function (x) {
                        return dom_1.div('.cell'
                            + ((!allowed && !over && puzzle.indexOf(x) !== -1) ? '.highlighted' : '')
                            + ((allowed && !over && selected.indexOf(x) !== -1) ? '.selected' : '')
                            + ((over && correct.indexOf(x) !== -1) ? '.correct' : '')
                            + ((over && wrong.indexOf(x) !== -1) ? '.wrong' : '')
                            + ((over && missed.indexOf(x) !== -1) ? '.missed' : ''), {
                            attrs: { 'data-index': x }
                        }, [dom_1.span()]);
                    }))
                ])
            ])
        ]);
    });
    return {
        dom: vtree$
    };
}
function main(sources) {
    return view(model(intent(sources)));
}
var drivers = {
    dom: dom_1.makeDOMDriver('#app')
};
xstream_run_1.run(main, drivers);
//# sourceMappingURL=index.js.map