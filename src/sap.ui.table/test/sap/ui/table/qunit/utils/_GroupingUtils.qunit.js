/*global QUnit, sinon, oTable */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/Table",
	"sap/ui/table/TreeTable",
	"sap/ui/table/AnalyticalTable",
	"sap/ui/table/Row",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/core/Core",
	"sap/ui/Device"
], function(
	TableQUnitUtils,
	nextUIUpdate,
	TableUtils,
	Table,
	TreeTable,
	AnalyticalTable,
	Row,
	FixedRowMode,
	oCore,
	Device
) {
	"use strict";

	const createTables = window.createTables;
	const destroyTables = window.destroyTables;
	const getCell = window.getCell;
	const getColumnHeader = window.getColumnHeader;
	const getRowHeader = window.getRowHeader;
	const getRowAction = window.getRowAction;
	const getSelectAll = window.getSelectAll;
	const iNumberOfRows = window.iNumberOfRows;
	const fakeSumRow = window.fakeSumRow;
	const fakeGroupRow = window.fakeGroupRow;
	const Grouping = TableUtils.Grouping;

	QUnit.module("Misc");

	QUnit.test("Connection to TableUtils", function(assert) {
		assert.ok(!!TableUtils.Grouping, "Grouping namespace available");
		assert.ok(TableUtils.Grouping.TableUtils === TableUtils, "Dependency forwarding of TableUtils correct");
	});

	QUnit.module("Determine row type", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("isInSummaryRow", async function(assert) {
		oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		oTable.setRowActionCount(1);
		await nextUIUpdate();

		return fakeSumRow(0).then(function() {
			assert.ok(TableUtils.Grouping.isInSummaryRow(getCell(0, 0)), "DATACELL in sum row");
			assert.ok(!TableUtils.Grouping.isInSummaryRow(getCell(1, 0)), "DATACELL in normal row");

			assert.ok(TableUtils.Grouping.isInSummaryRow(getRowHeader(0)), "ROWHEADER in sum row");
			assert.ok(!TableUtils.Grouping.isInSummaryRow(getRowHeader(1)), "ROWHEADER in normal row");

			assert.ok(TableUtils.Grouping.isInSummaryRow(getRowAction(0)), "ROWACTION in sum row");
			assert.ok(!TableUtils.Grouping.isInSummaryRow(getRowAction(1)), "ROWACTION in normal row");

			assert.ok(!TableUtils.Grouping.isInSummaryRow(getColumnHeader(0)), "COLUMNHEADER");
			assert.ok(!TableUtils.Grouping.isInSummaryRow(getSelectAll()), "COLUMNROWHEADER");
			assert.ok(!TableUtils.Grouping.isInSummaryRow(null), "null");
			assert.ok(!TableUtils.Grouping.isInSummaryRow(document.getElementById("outerelement")), "Foreign DOM");
		});
	});

	QUnit.test("isInGroupHeaderRow", async function(assert) {
		oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		oTable.setRowActionCount(1);
		await nextUIUpdate();

		return fakeGroupRow(0).then(function() {
			assert.ok(TableUtils.Grouping.isInGroupHeaderRow(getCell(0, 0)), "DATACELL in group row");
			assert.ok(!TableUtils.Grouping.isInGroupHeaderRow(getCell(1, 0)), "DATACELL in normal row");

			assert.ok(TableUtils.Grouping.isInGroupHeaderRow(getRowHeader(0)), "ROWHEADER in group row");
			assert.ok(!TableUtils.Grouping.isInGroupHeaderRow(getRowHeader(1)), "ROWHEADER in normal row");

			assert.ok(TableUtils.Grouping.isInGroupHeaderRow(getRowAction(0)), "ROWACTION in group row");
			assert.ok(!TableUtils.Grouping.isInGroupHeaderRow(getRowAction(1)), "ROWACTION in normal row");

			assert.ok(!TableUtils.Grouping.isInGroupHeaderRow(getColumnHeader(0)), "COLUMNHEADER");
			assert.ok(!TableUtils.Grouping.isInGroupHeaderRow(getSelectAll()), "COLUMNROWHEADER");
			assert.ok(!TableUtils.Grouping.isInGroupHeaderRow(null), "null");
			assert.ok(!TableUtils.Grouping.isInGroupHeaderRow(document.getElementById("outerelement")), "Foreign DOM");
		});
	});

	QUnit.module("Hierarchy modes", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		assertMode: function(assert, sExpectedMode, sMessage) {
			sMessage = "Table is in mode '" + sExpectedMode + "'" + (sMessage ? " - " + sMessage : "");
			assert.strictEqual(TableUtils.Grouping.getHierarchyMode(this.oTable), sExpectedMode, sMessage);
		},
		assertAccessors: function(assert, bFlat, bGroup, bTree) {
			let sModeCSSClass = null;

			if (bGroup) {
				sModeCSSClass = "sapUiTableGroupMode";
			} else if (bTree) {
				sModeCSSClass = "sapUiTableTreeMode";
			}

			assert.strictEqual(Grouping.isInFlatMode(this.oTable), bFlat, "#isInFlatMode");
			assert.strictEqual(Grouping.isInGroupMode(this.oTable), bGroup, "#isInGroupMode");
			assert.strictEqual(Grouping.isInTreeMode(this.oTable), bTree, "#isInTreeMode");
			assert.strictEqual(Grouping.getModeCssClass(this.oTable), sModeCSSClass, "#getModeCssClass");
		},
		assertAccessorsForFlatMode: function(assert) {
			this.assertAccessors(assert, true, false, false);
		},
		assertAccessorsForGroupMode: function(assert) {
			this.assertAccessors(assert, false, true, false);
		},
		assertAccessorsForTreeMode: function(assert) {
			this.assertAccessors(assert, false, false, true);
		}
	});

	QUnit.test("Default", function(assert) {
		this.assertMode(assert, Grouping.HierarchyMode.Flat);
		this.assertAccessorsForFlatMode(assert);
	});

	QUnit.test("Set to default flat mode", function(assert) {
		Grouping.setToDefaultGroupMode(this.oTable);
		Grouping.setToDefaultFlatMode(this.oTable);
		this.assertMode(assert, Grouping.HierarchyMode.Flat);
		this.assertAccessorsForFlatMode(assert);
	});

	QUnit.test("Set to default group mode", function(assert) {
		Grouping.setToDefaultGroupMode(this.oTable);
		this.assertMode(assert, Grouping.HierarchyMode.Group);
		this.assertAccessorsForGroupMode(assert);
	});

	QUnit.test("Set to default tree mode", function(assert) {
		Grouping.setToDefaultTreeMode(this.oTable);
		this.assertMode(assert, Grouping.HierarchyMode.Tree);
		this.assertAccessorsForTreeMode(assert);
	});

	QUnit.test("Set mode to '" + Grouping.HierarchyMode.Flat + "'", function(assert) {
		Grouping.setHierarchyMode(this.oTable, Grouping.HierarchyMode.Group);
		Grouping.setHierarchyMode(this.oTable, Grouping.HierarchyMode.Flat);
		this.assertMode(assert, Grouping.HierarchyMode.Flat);
		this.assertAccessorsForFlatMode(assert);
	});

	QUnit.test("Set mode to '" + Grouping.HierarchyMode.Group + "'", function(assert) {
		Grouping.setHierarchyMode(this.oTable, Grouping.HierarchyMode.Group);
		this.assertMode(assert, Grouping.HierarchyMode.Group);
		this.assertAccessorsForGroupMode(assert);
	});

	QUnit.test("Set mode to '" + Grouping.HierarchyMode.Tree + "'", function(assert) {
		Grouping.setHierarchyMode(this.oTable, Grouping.HierarchyMode.Tree);
		this.assertMode(assert, Grouping.HierarchyMode.Tree);
		this.assertAccessorsForTreeMode(assert);
	});

	QUnit.test("Set mode to '" + Grouping.HierarchyMode.GroupedTree + "'", function(assert) {
		Grouping.setHierarchyMode(this.oTable, Grouping.HierarchyMode.GroupedTree);
		this.assertMode(assert, Grouping.HierarchyMode.GroupedTree);
		this.assertAccessorsForGroupMode(assert);
	});

	QUnit.test("Set invalid mode'", function(assert) {
		Grouping.setHierarchyMode(this.oTable, "I_do_not_exist");
		this.assertMode(assert, Grouping.HierarchyMode.Flat, "Set to invalid string");
		this.assertAccessorsForFlatMode(assert);

		Grouping.setHierarchyMode(this.oTable);
		this.assertMode(assert, Grouping.HierarchyMode.Flat, "Set to 'undefined'");
		this.assertAccessorsForFlatMode(assert);
	});

	QUnit.test("Table invalidation", function(assert) {
		const oInvalidate = this.spy(this.oTable, "invalidate");
		let sCurrentMode = "default flat";
		const mGroupModeSetter = {};
		const HierarchyMode = Grouping.HierarchyMode;

		mGroupModeSetter["default flat"] = Grouping.setToDefaultFlatMode.bind(Grouping, this.oTable);
		mGroupModeSetter["default group"] = Grouping.setToDefaultGroupMode.bind(Grouping, this.oTable);
		mGroupModeSetter["default tree"] = Grouping.setToDefaultTreeMode.bind(Grouping, this.oTable);
		mGroupModeSetter[HierarchyMode.Flat] = Grouping.setHierarchyMode.bind(Grouping, this.oTable, HierarchyMode.Flat);
		mGroupModeSetter[HierarchyMode.Group] = Grouping.setHierarchyMode.bind(Grouping, this.oTable, HierarchyMode.Group);
		mGroupModeSetter[HierarchyMode.Tree] = Grouping.setHierarchyMode.bind(Grouping, this.oTable, HierarchyMode.Tree);
		mGroupModeSetter[HierarchyMode.GroupedTree] = Grouping.setHierarchyMode.bind(Grouping, this.oTable, HierarchyMode.GroupedTree);

		[
			{newMode: "default flat", expectInvalidation: false},
			{newMode: HierarchyMode.Flat, expectInvalidation: false},
			{newMode: "default group", expectInvalidation: true},
			{newMode: "default group", expectInvalidation: false},
			{newMode: HierarchyMode.Group, expectInvalidation: false},
			{newMode: "default tree", expectInvalidation: true},
			{newMode: "default tree", expectInvalidation: false},
			{newMode: HierarchyMode.Tree, expectInvalidation: false},
			{newMode: HierarchyMode.Flat, expectInvalidation: true},
			{newMode: HierarchyMode.Group, expectInvalidation: true},
			{newMode: HierarchyMode.GroupedTree, expectInvalidation: true},
			{newMode: HierarchyMode.Tree, expectInvalidation: true},
			{newMode: HierarchyMode.GroupedTree, expectInvalidation: true}
		].forEach(function(mTestSettings) {
			mGroupModeSetter[mTestSettings.newMode]();
			assert.equal(oInvalidate.callCount, mTestSettings.expectInvalidation ? 1 : 0,
				"Set from " + sCurrentMode + " mode to " + mTestSettings.newMode + " mode");
			oInvalidate.resetHistory();
			sCurrentMode = mTestSettings.newMode;
		});
	});

	QUnit.module("Rendering", {
		beforeEach: async function() {
			this.oTreeTable = TableQUnitUtils.createTable(TreeTable, {
				rowMode: new FixedRowMode({
					rowCount: 12
				}),
				rows: "{/}",
				columns: TableQUnitUtils.createTextColumn(),
				models: TableQUnitUtils.createJSONModel(11)
			});
			await this.oTreeTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTreeTable.destroy();
		}
	});

	QUnit.test("showGroupMenuButton", function(assert) {
		const bOrigDesktop = Device.system.desktop;

		Device.system.desktop = false;
		assert.ok(!Grouping.showGroupMenuButton(new Table()), "sap.ui.table.Table / no desktop");
		assert.ok(!Grouping.showGroupMenuButton(new TreeTable()), "sap.ui.table.TreeTable / no desktop");
		assert.ok(Grouping.showGroupMenuButton(new AnalyticalTable()), "sap.ui.table.AnalyticalTable / no desktop");

		Device.system.desktop = true;
		assert.ok(!Grouping.showGroupMenuButton(new Table()), "sap.ui.table.Table / desktop");
		assert.ok(!Grouping.showGroupMenuButton(new TreeTable()), "sap.ui.table.TreeTable / desktop");
		assert.ok(!Grouping.showGroupMenuButton(new AnalyticalTable()), "sap.ui.table.AnalyticalTable / desktop");

		Device.system.desktop = bOrigDesktop;
	});

	QUnit.test("calcGroupIndent", function(assert) {
		const oRow = new Row();
		const oRowGetLevel = sinon.stub(oRow, "getLevel");

		oRowGetLevel.returns(1);
		assert.strictEqual(Grouping.calcGroupIndent(oRow), 0, "Level 1");

		oRowGetLevel.returns(2);
		assert.strictEqual(Grouping.calcGroupIndent(oRow), 0, "Level 2");

		oRowGetLevel.returns(3);
		assert.strictEqual(Grouping.calcGroupIndent(oRow), 24, "Level 3");

		oRowGetLevel.returns(4);
		assert.strictEqual(Grouping.calcGroupIndent(oRow), 36, "Level 4");

		oRowGetLevel.returns(5);
		assert.strictEqual(Grouping.calcGroupIndent(oRow), 44, "Level 5");

		oRowGetLevel.returns(6);
		assert.strictEqual(Grouping.calcGroupIndent(oRow), 52, "Level 6");
	});

	QUnit.test("calcTreeIndent", function(assert) {
		const oRow = new Row();
		const oRowGetLevel = sinon.stub(oRow, "getLevel");

		oRowGetLevel.returns(1);
		assert.strictEqual(Grouping.calcTreeIndent(oRow), 0, "Level 1");

		oRowGetLevel.returns(2);
		assert.strictEqual(Grouping.calcTreeIndent(oRow), 17, "Level 2");

		oRowGetLevel.returns(3);
		assert.strictEqual(Grouping.calcTreeIndent(oRow), 34, "Level 3");

		oRowGetLevel.returns(4);
		assert.strictEqual(Grouping.calcTreeIndent(oRow), 51, "Level 4");
	});

	QUnit.test("Tree Mode", function(assert) {
		for (const oRow of this.oTreeTable.getRows()) {
			const oTreeIcon = oRow.getDomRef("col0").querySelector(".sapUiTableTreeIcon");
			let sClass = "sapUiTableTreeIconNodeClosed";

			if (oRow.getIndex() === 11) {
				sClass = "sapUiTableTreeIconLeaf";
			}

			assert.ok(oTreeIcon != null, "Tree Icon Available in first column - " + oRow);
			assert.ok(oTreeIcon.classList.contains(sClass), "Icon has correct expand state: " + sClass);
		}
	});

	QUnit.test("Tree Mode; After expand", async function(assert) {
		this.oTreeTable.getRows()[0].expand();
		await this.oTreeTable.qunit.whenRenderingFinished();

		for (const oRow of this.oTreeTable.getRows()) {
			const oTreeIcon = oRow.getDomRef("col0").querySelector(".sapUiTableTreeIcon");
			const iRowIndex = oRow.getIndex();
			let sClass = "sapUiTableTreeIconNodeClosed";

			if (iRowIndex === 0) {
				sClass = "sapUiTableTreeIconNodeOpen";
			} else if (iRowIndex === 1) {
				sClass = "sapUiTableTreeIconLeaf";
			}

			assert.ok(oTreeIcon != null, "Tree Icon Available in first column - " + oRow);
			assert.ok(oTreeIcon.classList.contains(sClass), "Icon has correct expand state: " + sClass);
		}
	});

	QUnit.test("Tree Mode; After unbind with showNoData=false", async function(assert) {
		this.oTreeTable.setShowNoData(false);
		this.oTreeTable.unbindRows();
		await this.oTreeTable.qunit.whenRenderingFinished();

		for (const oRow of this.oTreeTable.getRows()) {
			const oTreeIcon = oRow.getDomRef("col0").querySelector(".sapUiTableTreeIcon");

			assert.ok(!oTreeIcon.classList.contains("sapUiTableTreeIconNodeOpen"),
				"No state class on icon after unbind: sapUiTableTreeIconNodeOpen");
			assert.ok(!oTreeIcon.classList.contains("sapUiTableTreeIconLeaf"),
				"No state class on icon after unbind: sapUiTableTreeIconLeaf");
			assert.ok(!oTreeIcon.classList.contains("sapUiTableTreeIconNodeClosed"),
				"No state class on icon after unbind: sapUiTableTreeIconNodeClosed");
		}
	});

	QUnit.test("Group Mode", async function(assert) {
		this.oTreeTable.setUseGroupMode(true);
		await this.oTreeTable.qunit.whenRenderingFinished();

		for (const oRow of this.oTreeTable.getRows()) {
			const iRowIndex = oRow.getIndex();
			const oRowElement = oRow.getDomRef();
			const oRowHeader = this.oTreeTable.qunit.getRowHeaderCell(iRowIndex).parentElement;
			const oGroupHeader = oRow.getDomRef("groupHeader");
			let bExpectGroupHeaderClass = true;

			if (iRowIndex === 11) {
				bExpectGroupHeaderClass = false;
			}

			assert.ok(oRowElement.classList.contains("sapUiTableGroupHeaderRow") && bExpectGroupHeaderClass
				|| !oRowElement.classList.contains("sapUiTableGroupHeaderRow") && !bExpectGroupHeaderClass,
				"Row " + oRow + " is Group Header");
			assert.ok(oRowHeader.classList.contains("sapUiTableGroupHeaderRow") && bExpectGroupHeaderClass
				|| !oRowHeader.classList.contains("sapUiTableGroupHeaderRow") && !bExpectGroupHeaderClass,
				"Row Header " + oRow + " is Group Header");

			if (bExpectGroupHeaderClass) {
				assert.ok(oGroupHeader.classList.contains("sapUiTableGroupIconClosed"), "Header has correct expand state");
			} else {
				assert.ok(!oGroupHeader.classList.contains("sapUiTableGroupIconClosed")
					&& !oGroupHeader.classList.contains("sapUiTableGroupIconOpen"),
					"Header has correct expand state");
			}
		}
	});

	QUnit.test("Group Mode; After expand", async function(assert) {
		this.oTreeTable.setUseGroupMode(true);
		this.oTreeTable.getRows()[0].expand();
		await this.oTreeTable.qunit.whenRenderingFinished();

		for (const oRow of this.oTreeTable.getRows()) {
			const iRowIndex = oRow.getIndex();
			const oRowElement = oRow.getDomRef();
			const oRowHeader = this.oTreeTable.qunit.getRowHeaderCell(iRowIndex).parentElement;
			const oGroupHeader = oRow.getDomRef("groupHeader");
			let bExpectGroupHeaderClass = true;
			let bExpectExpanded = false;

			if (iRowIndex === 1) {
				bExpectGroupHeaderClass = false;
			} else if (iRowIndex === 0) {
				bExpectExpanded = true;
			}

			assert.ok(oRowElement.classList.contains("sapUiTableGroupHeaderRow") && bExpectGroupHeaderClass
				|| !oRowElement.classList.contains("sapUiTableGroupHeaderRow") && !bExpectGroupHeaderClass,
				"Row " + oRow + " is Group Header");
			assert.ok(oRowHeader.classList.contains("sapUiTableGroupHeaderRow") && bExpectGroupHeaderClass
				|| !oRowHeader.classList.contains("sapUiTableGroupHeaderRow") && !bExpectGroupHeaderClass,
				"Row Header " + oRow + " is Group Header");

			if (bExpectExpanded) {
				assert.ok(oGroupHeader.classList.contains("sapUiTableGroupIconOpen"), "Header has correct expand state");
			} else if (bExpectGroupHeaderClass) {
				assert.ok(oGroupHeader.classList.contains("sapUiTableGroupIconClosed"), "Header has correct expand state");
			} else {
				assert.ok(!oGroupHeader.classList.contains("sapUiTableGroupIconClosed")
					&& !oGroupHeader.classList.contains("sapUiTableGroupIconOpen"),
					"Header has correct expand state");
			}
		}
	});

	QUnit.test("Group Mode; After unbind with showNoData=false", async function(assert) {
		this.oTreeTable.setUseGroupMode(true);
		this.oTreeTable.setShowNoData(false);
		this.oTreeTable.unbindRows();
		await this.oTreeTable.qunit.whenRenderingFinished();

		assert.notOk(this.oTreeTable.getRows().some((oRow) => oRow.getDomRef().classList.contains("sapUiTableGroupHeaderRow")),
			"Group headers after unbind");
	});

	QUnit.test("GroupMenuButton", async function(assert) {
		let oGroupMenuButton;

		this.oTreeTable.setUseGroupMode(true);
		await this.oTreeTable.qunit.whenRenderingFinished();

		for (const oRow of this.oTreeTable.getRows()) {
			oGroupMenuButton = this.oTreeTable.qunit.getRowHeaderCell(oRow.getIndex()).querySelector(".sapUiTableGroupMenuButton");
			assert.ok(oGroupMenuButton == null, "Row Header " + oRow + " has no GroupMenuButton");
		}

		sinon.stub(TableUtils.Grouping, "showGroupMenuButton").returns(true);
		this.oTreeTable.invalidate();
		await this.oTreeTable.qunit.whenRenderingFinished();

		for (const oRow of this.oTreeTable.getRows()) {
			oGroupMenuButton = this.oTreeTable.qunit.getRowHeaderCell(oRow.getIndex()).querySelector(".sapUiTableGroupMenuButton");
			assert.ok(oGroupMenuButton != null, "Row Header " + oRow + " has GroupMenuButton");
		}

		TableUtils.Grouping.showGroupMenuButton.restore();
	});

	/**
	 * @deprecated As of version 1.28
	 */
	QUnit.module("sap.ui.table.Table: Experimental Grouping", {
		beforeEach: function() {
			createTables();
			const oData = window.oModel.getData();
			for (let i = 0; i < iNumberOfRows; i++) {
				oData.rows[i][window.aFields[0]] = i < 4 ? "A" : "B";
			}
			window.oModel.setData(oData);
			oTable.getColumns()[0].setSortProperty(window.aFields[0]);
			oTable.getRowMode().setRowCount(12);
			oTable.setFixedColumnCount(0);
			oTable.setEnableGrouping(true);
			oCore.applyChanges();
		},
		afterEach: function() {
			destroyTables();
		},
		testAsync: function(mTestConfig) {
			return new Promise(function(resolve) {
				const oOnAfterRenderingDelegate = {
					onAfterRendering: onAfterRendering
				};

				function onRowsUpdated() {
					mTestConfig.test();
					resolve();
				}

				function onAfterRendering() {
					oTable.removeEventDelegate(oOnAfterRenderingDelegate);
					oTable.attachEventOnce("rowsUpdated", onRowsUpdated);
				}

				if (mTestConfig.onAfterRendering) {
					oTable.addEventDelegate(oOnAfterRenderingDelegate);
				} else {
					oTable.attachEventOnce("rowsUpdated", onRowsUpdated);
				}

				mTestConfig.act();
			});
		}
	});

	/**
	 * @deprecated As of version 1.28
	 */
	QUnit.test("Activate / Deactivate", function(assert) {
		const oBinding = oTable.getBinding();
		const that = this;

		assert.equal(oBinding.getLength(), 8, "Row count before Grouping");

		return this.testAsync({
			act: function() {
				oTable.setGroupBy(oTable.getColumns()[0]);
			},
			test: function() {
				assert.equal(oTable._getTotalRowCount(), 10, "Row count after grouping");
				for (let i = 0; i < oTable.getRows().length; i++) {
					if (i === 0 || i === 5) {
						assert.ok(oTable.getRows()[i].isGroupHeader(), "Row " + i + " is group header");
					} else {
						assert.ok(!oTable.getRows()[i].isGroupHeader(), "Row " + i + " is leaf");
					}
				}
			},
			onAfterRendering: true
		}).then(function() {
			return that.testAsync({
				act: function() {
					oTable.setEnableGrouping(false);
				},
				test: function() {
					assert.equal(oTable._getTotalRowCount(), 8, "Row count after reset grouping");
				}
			});
		});
	});

	/**
	 * @deprecated As of version 1.28
	 */
	QUnit.test("Collapse / Expand", function(assert) {
		const that = this;

		assert.equal(oTable._getTotalRowCount(), 8, "Row count before Grouping");

		return this.testAsync({
			act: function() {
				oTable.setGroupBy(oTable.getColumns()[0]);
			},
			test: function() {
				assert.equal(oTable._getTotalRowCount(), 10, "Row count after Grouping");
			},
			onAfterRendering: true
		}).then(function() {
			return that.testAsync({
				act: function() {
					oTable.getRows()[0].collapse();
				},
				test: function() {
					assert.equal(oTable._getTotalRowCount(), 6, "Row count after collapse");
					assert.notOk(oTable.getRows()[0].isExpanded(), "Row expanded state");
				}
			});
		}).then(function() {
			return that.testAsync({
				act: function() {
					oTable.getRows()[0].expand();
				},
				test: function() {
					assert.equal(oTable._getTotalRowCount(), 10, "Row count after expand");
					assert.ok(oTable.getRows()[0].isExpanded(0), "Row expanded state");
				}
			});
		}).then(function() {
			return that.testAsync({
				act: function() {
					oTable.getRows()[0].toggleExpandedState();
				},
				test: function() {
					assert.equal(oTable._getTotalRowCount(), 6, "Row count after toggle");
					assert.notOk(oTable.getRows()[0].isExpanded(), "Row expanded state");
				}
			});
		}).then(function() {
			return that.testAsync({
				act: function() {
					oTable.getRows()[0].toggleExpandedState();
				},
				test: function() {
					assert.equal(oTable._getTotalRowCount(), 10, "Row count after Toggle");
					assert.ok(oTable.getRows()[0].isExpanded(0), "Row expanded state");
				}
			});
		});
	});
});