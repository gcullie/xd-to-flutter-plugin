/*
Copyright 2020 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it. If you have received this file from a source other than Adobe,
then your use, modification, or distribution of it requires the prior
written permission of Adobe. 
*/

const xd = require("scenegraph");
const { formatDart } = require("../lib/dart_style");

function trace(...rest) {
	false && console.log(...rest);
}
exports.trace = trace;

function _printParameters(n, depth) {
	let d = depth || 0;
	let t = "";
	for (let i = 0; i < d; ++i)
		t += "  ";
	trace(`${t}node - ${n.constructor.name}`);
	if (n.parameters) {
		let values = Object.entries(n.parameters);
		for (let [key, value] of values) {
			trace(`    ${t}${key}`);
		}
	}
	if (n.children) {
		n.children.forEach((child) => {
			printParameters(child, d + 1);
		});
	}
}
exports._printParameters = _printParameters;

function _printTree(node, t="") {
	let str = `\n${t}${node.xdNode.name}(${node.constructor.name}, ${node.xdNode.constructor.name})`;
	let kids = node.children;
	for (var i=0; kids && (i<kids.length); i++) {
		str += _printTree(kids[i], t+"\t");
	}
	if (!t) { trace(str); }
	return str;
}
exports._printTree = _printTree;


// Everything below is designed to be used as a menu item:

function _imageFlipTest(selection, root) {
	let items = selection.items, imgSrc, target;
	for (let i=0; i < items.length; i++) {
		let o = items[i];
		if (o.fill instanceof xd.ImageFill) { imgSrc = o; }
		else if (o instanceof xd.Rectangle) { target = o; }
	}
	if (!imgSrc || !target) { trace("select two rectangles, one with an image fill, one without."); return; }
	target.fill = imgSrc.fill;
	trace("src matrix:", imgSrc.transform);
}
exports._imageFlipTest = _imageFlipTest;

async function _printdumpNodePluginData(selection, root) {
	let _dumpPluginData = (pluginData, depth) => {
		if (!pluginData)
			return;
		let t = "";
		for (let i = 0; i < depth; ++i)
			t += "  ";
		for (let [k, v] of Object.entries(pluginData)) {
			trace(`${t}${k} => ${v}`);
		}
	};
	let _dumpNodePluginData = (xdNode, depth) => {
		if (!xdNode)
			return;
		let d = depth || 0;
		_dumpPluginData(xdNode.pluginData, d);
		xdNode.children.forEach((child) => {
			_dumpNodePluginData(child, d + 1);
		});
	};
	for (let i = 0; i < selection.items.length; ++i) {
		let item = selection.items[i];
		_dumpNodePluginData(item);
	}
}
exports._printdumpNodePluginData = _printdumpNodePluginData;

/* for performance testing the formatDart method: */
async function _testDartStyle(selection, root) {
	let el = selection.items[0];
	if (!(el instanceof xd.Text)) { trace("select text"); return; }
	let str = el.text, count=0, maxT=1000, result;
	let t = Date.now();
	while (Date.now() - t < maxT) {
		result = formatDart(str);
		count++;
	}
	t = Date.now() - t;
	trace(result);
	trace("-------------------");
	trace(str.length + " characters formatted");
	trace(count + " iterations took " + t + "ms (avg: " + (t/count).toFixed(1) + "ms)");
}
exports._testDartStyle = _testDartStyle;