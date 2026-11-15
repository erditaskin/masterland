import XCTest
import UIKit
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
    func testHeldSelectedItemCanStillMerge(){
        app.open(URL(string:"masterland://review")!)
        XCTAssertTrue(app.buttons["order-quest26"].waitForExistence(timeout:10))
        cell(0).tap()
        cell(0).press(forDuration:0.7,thenDragTo:cell(1))
        XCTAssertEqual(cell(0).label,"Boş hücre")
        XCTAssertEqual(cell(1).label,"Buğday demeti")
        XCTAssertFalse(app.buttons["closePage"].exists)
        cell(2).press(forDuration:1.0,thenDragTo:cell(17))
        XCTAssertEqual(cell(2).label,"Boş hücre")
        XCTAssertEqual(cell(17).label,"Buğday demeti")
        shot("held-selection-merge")
    }
    func testTapMergeAndLockedTierExplanation(){
        app.open(URL(string:"masterland://review")!)
        XCTAssertTrue(app.buttons["order-quest26"].waitForExistence(timeout:10))
        cell(0).tap();cell(1).tap()
        XCTAssertEqual(cell(0).label,"Boş hücre")
        XCTAssertEqual(cell(1).label,"Buğday demeti")
        cell(1).tap();cell(3).tap()
        XCTAssertTrue(app.buttons["closePage"].waitForExistence(timeout:5))
        app.buttons["closePage"].tap()
        XCTAssertEqual(cell(1).label,"Buğday demeti")
        XCTAssertEqual(cell(3).label,"Buğday demeti")
        cell(2).tap();cell(8).tap()
        XCTAssertEqual(cell(2).label,"Buğday başağı")
        XCTAssertEqual(cell(8).label,"Küçük un torbası")
        cell(2).press(forDuration:0.1,thenDragTo:cell(17))
        XCTAssertEqual(cell(17).label,"Buğday demeti")
        shot("tap-merge-and-locked-tier")
    }
    func testOffCentreGrabUsesReleaseCell(){
        app.buttons["producer1"].tap();app.buttons["producer1"].tap()
        let from=cell(0).coordinate(withNormalizedOffset:CGVector(dx:0.15,dy:0.5))
        let to=cell(1).coordinate(withNormalizedOffset:CGVector(dx:0.85,dy:0.5))
        from.press(forDuration:0.1,thenDragTo:to)
        XCTAssertEqual(cell(0).label,"Boş hücre")
        XCTAssertEqual(cell(1).label,"Buğday demeti")
        XCTAssertEqual(cell(2).label,"Boş hücre")
        shot("off-centre-grab-merge")
    }
    func testBlockedPurchaseFeedbackIsVisibleAbovePage(){
        app.buttons["producer5"].tap()
        XCTAssertTrue(app.buttons["buyProducer"].waitForExistence(timeout:5))
        app.buttons["buyProducer"].tap()
        let feedback=app.descendants(matching:.any).matching(identifier:"actionFeedback").firstMatch
        XCTAssertTrue(feedback.waitForExistence(timeout:3))
        XCTAssertTrue(feedback.isHittable)
        XCTAssertTrue(feedback.label.contains("seviye") || feedback.label.contains("altın"))
        XCTAssertTrue(app.buttons["closePage"].exists)
        XCTAssertTrue(app.buttons["buyProducer"].exists)
        app.buttons["closePage"].tap()
        XCTAssertTrue(app.buttons["gold"].label.contains("0"))
        shot("visible-blocked-purchase-feedback")
    }
    func testThemedCityMapKeepsFutureCitiesLocked(){
        app.open(URL(string:"masterland://review")!)
        XCTAssertTrue(app.buttons["producer1"].waitForExistence(timeout:10))
        let beforeGold=app.buttons["gold"].label
        app.buttons["tab-cities"].tap()
        XCTAssertTrue(app.buttons["map-city1"].waitForExistence(timeout:5))
        XCTAssertTrue(app.buttons["map-step-city1-5"].label.contains("Kilitli"))
        app.buttons["jump-city2"].tap()
        app.buttons["map-city2"].tap()
        let second=app.descendants(matching:.any).matching(identifier:"map-lock-city2").firstMatch
        XCTAssertTrue(second.waitForExistence(timeout:3))
        XCTAssertTrue(second.label.contains("2. seviyede açılacak"))
        app.buttons["jump-city3"].tap()
        app.buttons["map-city3"].tap()
        let third=app.descendants(matching:.any).matching(identifier:"map-lock-city3").firstMatch
        XCTAssertTrue(third.waitForExistence(timeout:3))
        XCTAssertTrue(third.label.contains("5. seviyede açılacak"))
        shot("themed-city-map-locked-cove")
        app.buttons["jump-city1"].tap()
        app.buttons["map-city1"].tap()
        XCTAssertTrue(app.buttons["producer1"].waitForExistence(timeout:5))
        XCTAssertEqual(app.buttons["gold"].label,beforeGold)
        XCTAssertEqual(cell(0).label,"Buğday başağı")
    }
    func testReadyOrderDoubleTapAndFastOpening(){
        app.buttons["producer1"].tap();app.buttons["producer1"].tap();drag(0,1)
        XCTAssertTrue(app.buttons["order-quest25"].label.contains("Hazır"))
        app.buttons["order-quest25"].tap(withNumberOfTaps:2,numberOfTouches:1)
        XCTAssertTrue(app.buttons["gold"].label.contains("60"))
        XCTAssertFalse(app.buttons["closePage"].exists)
        app.buttons["producer5"].tap();app.buttons["buyProducer"].tap();app.buttons["closePage"].tap()
        XCTAssertTrue(app.buttons["gold"].label.contains("20"))
        app.buttons["producer5"].tap();XCTAssertNotEqual(cell(0).label,"Boş hücre")
        shot("ready-orders-and-fast-opening")
    }
    func testUpperTierChainHasExplicitUnlockAndFinalFeedback(){
        app.open(URL(string:"masterland://review")!)
        XCTAssertTrue(app.buttons["producer1"].waitForExistence(timeout:10))
        cell(1).tap();cell(3).tap()
        XCTAssertTrue(app.buttons["unlock-item27"].waitForExistence(timeout:5))
        app.buttons["unlock-item27"].tap();app.buttons["closePage"].tap();cell(3).tap()
        XCTAssertEqual(cell(3).label,"Tahıl çuvalı")
        cell(2).tap();cell(17).tap();cell(4).tap()
        XCTAssertEqual(cell(4).label,"Tahıl çuvalı")
        cell(3).tap()
        XCTAssertTrue(app.buttons["unlock-item49"].waitForExistence(timeout:5))
        app.buttons["unlock-item49"].tap();app.buttons["closePage"].tap();cell(3).tap()
        XCTAssertEqual(cell(3).label,"Buğday arabası")
        shot("upper-tier-chain-verified")
    }
    func testRapidProducerTapsAndCooldown(){
        for _ in 0..<2 {app.buttons["producer1"].tap(withNumberOfTaps:10,numberOfTouches:1)};energy("80/100")
        app.buttons["producer1"].tap(withNumberOfTaps:10,numberOfTouches:1);energy("70/100")
        app.buttons["producer1"].tap();energy("70/100");XCTAssertEqual(cell(29).label,"Buğday başağı");XCTAssertEqual(cell(30).label,"Boş hücre");shot("rn-rapid-input")
    }
    func testSelectionInvalidReleaseAndNextGesture(){
        app.buttons["producer1"].tap();app.buttons["producer1"].tap();cell(0).tap()
        XCTAssertEqual(cell(0).value as? String,"Seçili")
        XCTAssertEqual(cell(1).value as? String,"")
        let frame=cell(0).frame;XCTAssertEqual(frame.width/frame.height,(732.0/6)/(710.0/8),accuracy:0.015)
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
        XCTAssertEqual(first.width/first.height,(732.0/6)/(710.0/8),accuracy:0.015);XCTAssertEqual(first.width,last.width,accuracy:0.5);XCTAssertEqual(first.height,last.height,accuracy:0.5);XCTAssertLessThan(last.maxY,app.buttons["tab-board"].frame.minY)
        let a=app.buttons["order-quest25"].frame,b=app.buttons["order-repeat-0-0"].frame;XCTAssertEqual(a.width,b.width,accuracy:0.5)
        let end=app.buttons["order-repeat-0-4"];for _ in 0..<3 where !end.isHittable {app.scrollViews.allElementsBoundByIndex.first(where:{$0.frame.minY<=a.midY && $0.frame.maxY>=a.midY})!.swipeLeft()};XCTAssertTrue(end.isHittable);shot("rn-geometry")
    }
    func testBackgroundAndNormalSaveReload(){
        app.launch();XCTAssertTrue(app.buttons["producer1"].waitForExistence(timeout:20))
        let gold=app.buttons["gold"].label,gems=app.buttons["gems"].label,profile=app.buttons["profile"].label
        XCUIDevice.shared.press(.home);app.activate();XCTAssertEqual(app.buttons["gold"].label,gold)
        app.terminate();app.launch();XCTAssertTrue(app.buttons["producer1"].waitForExistence(timeout:20));XCTAssertEqual(app.buttons["gold"].label,gold);XCTAssertEqual(app.buttons["gems"].label,gems);XCTAssertEqual(app.buttons["profile"].label,profile);shot("rn-normal-save")
    }
    func testVisualMeasurements() throws {
        app.open(URL(string:"masterland://review")!)
        XCTAssertTrue(app.buttons["order-quest26"].waitForExistence(timeout:10))
        func rect(_ e:XCUIElement)->[String:Double] {let r=e.frame;return ["x":r.minX,"y":r.minY,"width":r.width,"height":r.height]}
        var values:[String:Any] = ["screen":rect(app),"scale":UIScreen.main.scale]
        for id in ["profile","stamina","gold","gems","profile-menu","info","producer1","producer5","producer8","producer6","producer7","tab-board","tab-collection","tab-cities","tab-storage","tab-market","order-quest26"] {values[id]=rect(app.buttons[id])}
        values["cells"]=(0..<54).map {rect(cell($0))}
        let data=try JSONSerialization.data(withJSONObject:values,options:[.prettyPrinted,.sortedKeys])
        let attachment=XCTAttachment(data:data,uniformTypeIdentifier:"public.json");attachment.name="visual-measurements.json";attachment.lifetime = .keepAlways;add(attachment)
        shot("masterland-v11-measured")
        XCTAssertEqual(cell(0).frame.width,cell(53).frame.width,accuracy:0.5)
        XCTAssertEqual(cell(0).frame.height,cell(53).frame.height,accuracy:0.5)
        XCTAssertEqual(cell(0).frame.width/cell(0).frame.height,(732.0/6)/(710.0/8),accuracy:0.015)
        XCTAssertGreaterThanOrEqual(cell(0).frame.width,44)
        XCTAssertGreaterThanOrEqual(cell(0).frame.height,44)
    }

    func testSoundSettingDoesNotResetBoard(){
        app.buttons["producer1"].tap();energy("99/100")
        app.buttons["profile-menu"].tap();XCTAssertTrue(app.switches["setting-sound"].waitForExistence(timeout:5));app.switches["setting-sound"].tap();app.buttons["closePage"].tap()
        XCTAssertEqual(cell(0).label,"Buğday başağı");energy("99/100")
        app.buttons["profile-menu"].tap();app.switches["setting-sound"].tap();app.buttons["closePage"].tap()
        app.buttons["producer1"].tap();energy("98/100");drag(0,1);XCTAssertEqual(cell(1).label,"Buğday demeti");shot("sound-settings-preserve-board")
    }

}
