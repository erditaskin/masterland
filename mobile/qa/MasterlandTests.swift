import XCTest
final class MasterlandTests:XCTestCase {
    let app=XCUIApplication(bundleIdentifier:"com.erditaskin.masterland")
    override func setUpWithError() throws {
        continueAfterFailure=false
        app.open(URL(string:"masterland://qa-reset")!)
        XCTAssertTrue(app.buttons["producer1"].waitForExistence(timeout:30))
        let settled=XCTNSPredicateExpectation(predicate:NSPredicate { _,_ in self.app.buttons["producer1"].frame.height>=44 },object:nil)
        XCTAssertEqual(XCTWaiter.wait(for:[settled],timeout:10),.completed)
    }
    func cell(_ i:Int)->XCUIElement {app.descendants(matching:.any).matching(identifier:"cell-\(i)").firstMatch}
    func drag(_ a:Int,_ b:Int){cell(a).press(forDuration:0.1,thenDragTo:cell(b))}
    func energy(_ expected:String){XCTAssertTrue(app.buttons["stamina"].label.contains(expected),app.buttons["stamina"].label)}
    func shot(_ name:String){let a=XCTAttachment(screenshot:app.screenshot());a.name=name;a.lifetime = .keepAlways;add(a)}
    func testMergeJourneyAndProducerPurchase(){
        energy("100/100");app.buttons["producer1"].tap();app.buttons["producer1"].tap();energy("98/100")
        XCTAssertEqual(cell(0).label,"Buğday başağı");let size=cell(0).frame.size
        cell(0).tap();XCTAssertEqual(cell(0).frame.width,size.width,accuracy:0.5)
        drag(0,1);XCTAssertEqual(cell(1).label,"Buğday demeti")
        app.buttons["order-quest25"].tap();XCTAssertTrue(app.buttons["order-quest26"].waitForExistence(timeout:5))
        for _ in 0..<4 {app.buttons["producer1"].tap()};drag(0,1);drag(2,3)
        app.buttons["order-quest26"].tap();XCTAssertTrue(app.buttons["order-quest27"].waitForExistence(timeout:5))
        app.buttons["producer5"].tap();XCTAssertTrue(app.buttons["buyProducer"].waitForExistence(timeout:5));app.buttons["buyProducer"].tap();app.buttons["closePage"].tap()
        app.buttons["producer5"].tap();app.buttons["producer5"].tap();drag(0,1)
        app.buttons["order-quest27"].tap();XCTAssertTrue(app.buttons["order-quest28"].waitForExistence(timeout:5));shot("rn-first-journey")
    }
    func testRapidProducerTapsAndCooldown(){
        for _ in 0..<2 {app.buttons["producer1"].tap(withNumberOfTaps:10,numberOfTouches:1)};energy("80/100")
        app.buttons["producer1"].tap(withNumberOfTaps:10,numberOfTouches:1);energy("70/100")
        app.buttons["producer1"].tap();energy("70/100");XCTAssertEqual(cell(29).label,"Buğday başağı");XCTAssertEqual(cell(30).label,"Boş hücre");shot("rn-rapid-input")
    }
    func testSelectionInvalidReleaseAndNextGesture(){
        app.buttons["producer1"].tap();app.buttons["producer1"].tap();cell(0).tap()
        let frame=cell(0).frame;XCTAssertEqual(frame.width,frame.height,accuracy:0.5)
        cell(0).coordinate(withNormalizedOffset:CGVector(dx:0.5,dy:0.5)).press(forDuration:0.1,thenDragTo:app.coordinate(withNormalizedOffset:CGVector(dx:0,dy:0)).withOffset(CGVector(dx:2,dy:frame.midY)))
        XCTAssertEqual(cell(0).label,"Buğday başağı");energy("98/100");drag(0,1);XCTAssertEqual(cell(1).label,"Buğday demeti");shot("rn-selection-and-merge")
    }
    func testFullScreenPagesAndStorage(){
        app.buttons["producer1"].tap();cell(0).press(forDuration:0.6)
        XCTAssertTrue(app.buttons["storeSelected"].waitForExistence(timeout:5));app.buttons["storeSelected"].tap();XCTAssertEqual(cell(0).label,"Boş hücre")
        for tab in ["collection","cities","storage","market"] {
            app.buttons["tab-"+tab].tap();XCTAssertTrue(app.buttons["closePage"].waitForExistence(timeout:5));XCTAssertLessThan(app.buttons["closePage"].frame.midY,app.frame.height*0.2);XCTAssertGreaterThan(app.scrollViews.firstMatch.frame.height,app.frame.height*0.6);shot("rn-"+tab);app.buttons["closePage"].tap()
        }
        app.buttons["tab-storage"].tap();app.buttons["storage-0"].tap();app.buttons["closePage"].tap();XCTAssertEqual(cell(0).label,"Buğday başağı")
    }
    func testGeometryAndScrollableOrders(){
        let first=cell(0).frame,last=cell(53).frame
        XCTAssertEqual(first.width,first.height,accuracy:0.5);XCTAssertEqual(first.height,last.height,accuracy:0.5);XCTAssertLessThan(last.maxY,app.buttons["tab-board"].frame.minY)
        let a=app.buttons["order-quest25"].frame,b=app.buttons["order-repeat-0-0"].frame;XCTAssertEqual(a.width,b.width,accuracy:0.5)
        let end=app.buttons["order-repeat-0-4"];for _ in 0..<3 where !end.isHittable {app.scrollViews.allElementsBoundByIndex.first(where:{$0.frame.minY<=a.midY && $0.frame.maxY>=a.midY})!.swipeLeft()};XCTAssertTrue(end.isHittable);shot("rn-geometry")
    }
    func testBackgroundAndNormalSaveReload(){
        app.launch();XCTAssertTrue(app.buttons["producer1"].waitForExistence(timeout:20))
        let gold=app.buttons["gold"].label,gems=app.buttons["gems"].label,profile=app.buttons["profile"].label
        XCUIDevice.shared.press(.home);app.activate();XCTAssertEqual(app.buttons["gold"].label,gold)
        app.terminate();app.launch();XCTAssertTrue(app.buttons["producer1"].waitForExistence(timeout:20));XCTAssertEqual(app.buttons["gold"].label,gold);XCTAssertEqual(app.buttons["gems"].label,gems);XCTAssertEqual(app.buttons["profile"].label,profile);shot("rn-normal-save")
    }
}
