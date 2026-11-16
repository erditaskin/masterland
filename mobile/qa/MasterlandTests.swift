import XCTest
import StoreKitTest
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
    func cells(named name:String)->[Int] {(0..<54).filter {cell($0).label == name}}
    func mergePair(_ name:String) {
        let pair=cells(named:name);XCTAssertGreaterThanOrEqual(pair.count,2)
        guard pair.count>=2 else {return};drag(pair[0],pair[1])
    }
    func drag(_ a:Int,_ b:Int){cell(a).press(forDuration:0.1,thenDragTo:cell(b))}
    func energy(_ expected:String){XCTAssertTrue(app.buttons["stamina"].label.contains(expected),app.buttons["stamina"].label)}
    func shot(_ name:String){let a=XCTAttachment(screenshot:app.screenshot());a.name=name;a.lifetime = .keepAlways;add(a)}
    func testScatteredProductionAndCompactControls() {
        let initial = cell(0).frame
        for _ in 0..<8 {app.buttons["producer1"].tap()}
        energy("92")
        let positions=(0..<54).filter {cell($0).label == "Buğday başağı"}
        XCTAssertEqual(positions.count,8)
        for i in positions {
            if i % 6 < 5 {XCTAssertFalse(positions.contains(i+1))}
            XCTAssertFalse(positions.contains(i+6))
        }
        cell(positions[0]).tap();cell(positions[1]).tap()
        XCTAssertEqual(cell(positions[1]).label,"Buğday demeti")
        XCTAssertFalse(app.buttons["info"].exists)
        app.buttons["profile-menu"].tap()
        XCTAssertTrue(app.buttons["closePage"].waitForExistence(timeout:5))
        app.buttons["closePage"].tap()
        XCTAssertEqual(initial.width,cell(0).frame.width,accuracy:0.5)
        XCTAssertGreaterThanOrEqual(app.buttons["producer1"].frame.width,48)
        shot("scattered-production-controls")
        app.open(URL(string:"masterland://review")!)
        XCTAssertTrue(app.buttons["order-quest26"].waitForExistence(timeout:10))
        app.buttons["order-quest26"].tap()
        XCTAssertTrue(app.buttons["order-quest27"].waitForExistence(timeout:5))
        app.buttons["order-quest27"].tap()
        XCTAssertTrue(app.buttons["order-quest28"].waitForExistence(timeout:5))
        for _ in 0..<8 { if app.buttons["dismissReward"].exists {app.buttons["dismissReward"].tap()} }
        let orderY=app.buttons.matching(NSPredicate(format:"identifier BEGINSWITH 'order-'" )).allElementsBoundByIndex.first(where: {$0.isHittable})!.frame.midY / app.frame.height
        for _ in 0..<2 {
            app.coordinate(withNormalizedOffset:CGVector(dx:0.85,dy:orderY)).press(forDuration:0.1,thenDragTo:app.coordinate(withNormalizedOffset:CGVector(dx:0.15,dy:orderY)))
        }
        XCTAssertTrue(app.buttons["order-quest28"].isHittable)
        shot("multi-product-order-controls")
        for i in 0..<54 {XCTAssertEqual(cell(i).frame.width,cell(i).frame.height,accuracy:0.5)}
        XCTAssertLessThan(app.buttons["profile-menu"].frame.maxY,app.buttons["order-quest28"].frame.minY)
    }
    func testMergeJourneyAndProducerPurchase(){
        energy("100");app.buttons["producer1"].tap();app.buttons["producer1"].tap();energy("98")
        let pieces=cells(named:"Buğday başağı"), size=cell(pieces[0]).frame.size
        cell(pieces[0]).tap();XCTAssertEqual(cell(pieces[0]).frame.width,size.width,accuracy:0.5)
        drag(pieces[0],pieces[1]);XCTAssertEqual(cell(pieces[1]).label,"Buğday demeti")
        app.buttons["order-quest25"].tap();XCTAssertTrue(app.buttons["order-quest26"].waitForExistence(timeout:5))
        for _ in 0..<4 {app.buttons["producer1"].tap()};mergePair("Buğday başağı");mergePair("Buğday başağı")
        app.buttons["order-quest26"].tap();XCTAssertTrue(app.buttons["order-quest27"].waitForExistence(timeout:5))
        app.buttons["producer5"].tap();XCTAssertTrue(app.buttons["buyProducer"].waitForExistence(timeout:5));app.buttons["buyProducer"].tap();app.buttons["closePage"].tap()
        app.buttons["producer5"].tap();app.buttons["producer5"].tap();mergePair("Küçük un torbası")
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
        XCTAssertTrue(app.buttons["achievement-achievement6"].label.contains("1/6"))
        app.buttons["jump-city2"].tap()
        XCTAssertTrue(app.buttons["jump-city2"].isSelected)
        XCTAssertFalse(app.buttons["jump-city1"].isSelected)
        shot("active-city-new-haven")
        app.buttons["map-city2"].tap()
        let second=app.descendants(matching:.any).matching(identifier:"map-lock-city2").firstMatch
        XCTAssertTrue(second.waitForExistence(timeout:3))
        XCTAssertTrue(second.label.contains("2. seviyede açılacak"))
        app.buttons["jump-city3"].tap()
        XCTAssertTrue(app.buttons["jump-city3"].isSelected)
        XCTAssertFalse(app.buttons["jump-city2"].isSelected)
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
        app.buttons["producer1"].tap();app.buttons["producer1"].tap();mergePair("Buğday başağı")
        let readyIndex=cells(named:"Buğday demeti")[0]
        XCTAssertTrue(app.buttons["order-quest25"].label.contains("Hazır"))
        XCTAssertTrue(app.descendants(matching:.any).matching(identifier:"ready-order-cell-\(readyIndex)").firstMatch.exists)
        app.buttons["order-quest25"].tap(withNumberOfTaps:2,numberOfTouches:1)
        XCTAssertTrue(app.buttons["gold"].label.contains("60"))
        XCTAssertFalse(app.descendants(matching:.any).matching(identifier:"ready-order-cell-\(readyIndex)").firstMatch.exists)
        XCTAssertFalse(app.buttons["closePage"].exists)
        app.buttons["producer5"].tap();app.buttons["buyProducer"].tap();app.buttons["closePage"].tap()
        XCTAssertTrue(app.buttons["gold"].label.contains("20"))
        app.buttons["producer5"].tap();XCTAssertEqual(cells(named:"Küçük un torbası").count,1)
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
    func testAchievementGiftAndPowerThreshold(){
        app.open(URL(string:"masterland://review")!)
        XCTAssertTrue(app.buttons["producer1"].waitForExistence(timeout:10))
        app.buttons["tab-cities"].tap();app.buttons["achievement-achievement1"].tap()
        XCTAssertTrue(app.buttons["claimAchievement"].waitForExistence(timeout:5))
        app.buttons["claimAchievement"].tap(withNumberOfTaps:2,numberOfTouches:1)
        XCTAssertFalse(app.buttons["claimAchievement"].exists)
        shot("achievement-reward-claimed")
        app.buttons["returnToRoute"].tap();app.buttons["map-city1"].tap();energy("111")
        app.buttons["producer1"].press(forDuration:0.6)
        XCTAssertTrue(app.otherElements["producerPowerMenu"].waitForExistence(timeout:5))
        XCTAssertFalse(app.buttons["closePage"].exists)
        app.buttons["powerProductDetails"].tap()
        app.buttons["unlock-item27"].tap();app.buttons["unlock-item49"].tap();app.buttons["closePage"].tap()
        app.buttons["producer1"].press(forDuration:0.6);app.buttons["power-4"].tap()
        app.buttons["producer1"].tap();energy("103");XCTAssertEqual(cells(named:"Buğday arabası").count,1)
        app.buttons["producer1"].tap();energy("95");XCTAssertEqual(cells(named:"Buğday arabası").count,2)
        app.buttons["producer1"].tap();energy("94");XCTAssertEqual(cells(named:"Buğday başağı").count,5)
        XCTAssertTrue(app.buttons["producer1"].label.contains("4x seçili, 1x etkin"))
        shot("power-threshold-fallback")
    }
    func testGemCapacityPurchase(){
        app.open(URL(string:"masterland://review")!)
        XCTAssertTrue(app.buttons["stamina"].waitForExistence(timeout:10))
        app.buttons["stamina"].tap();app.buttons["upgradeEnergyCapacity"].tap();app.buttons["closePage"].tap()
        energy("111");XCTAssertTrue(app.buttons["gems"].label.contains("2"))
        shot("gem-energy-capacity")
    }
    func testAchievementRouteRestoresScrollPosition(){
        app.buttons["tab-cities"].tap();app.buttons["jump-city3"].tap()
        let y=app.buttons["achievement-achievement10"].frame.minY
        app.buttons["achievement-achievement10"].tap()
        XCTAssertTrue(app.buttons["returnToRoute"].waitForExistence(timeout:5))
        app.buttons["returnToRoute"].tap()
        XCTAssertTrue(app.buttons["map-city3"].waitForExistence(timeout:5))
        let settled=XCTNSPredicateExpectation(predicate:NSPredicate { _,_ in abs(self.app.buttons["achievement-achievement10"].frame.minY-y)<1 },object:nil)
        XCTAssertEqual(XCTWaiter.wait(for:[settled],timeout:5),.completed)
        shot("achievement-route-restored")
    }
    func testProducerPowerMenuIsLocalAndPerProducer(){
        app.open(URL(string:"masterland://review")!)
        XCTAssertTrue(app.buttons["stamina"].waitForExistence(timeout:10))
        app.buttons["stamina"].tap();app.buttons["upgradeEnergyCapacity"].tap();app.buttons["closePage"].tap()
        app.buttons["producer6"].press(forDuration:0.6)
        let menu=app.otherElements["producerPowerMenu"]
        XCTAssertTrue(menu.waitForExistence(timeout:5));XCTAssertLessThan(menu.frame.width,app.frame.width*0.4)
        XCTAssertFalse(app.buttons["closePage"].exists)
        shot("anchored-producer-power-menu")
        app.buttons["power-2"].tap();XCTAssertFalse(menu.exists)
        XCTAssertTrue(app.buttons["producer1"].label.contains("1x seçili"))
        app.buttons["producer6"].tap();energy("109");XCTAssertEqual(cells(named:"Krema").count,3)
        app.buttons["producer6"].press(forDuration:0.6)
        app.coordinate(withNormalizedOffset:CGVector(dx:0.02,dy:0.85)).tap()
        XCTAssertFalse(menu.exists)
    }
    func testRapidProducerTapsAndCooldown(){
        for _ in 0..<2 {app.buttons["producer1"].tap(withNumberOfTaps:10,numberOfTouches:1)};energy("80")
        app.buttons["producer1"].tap(withNumberOfTaps:10,numberOfTouches:1);energy("70")
        app.buttons["producer1"].tap();energy("70");XCTAssertEqual(cells(named:"Buğday başağı").count,30);XCTAssertEqual(cells(named:"Boş hücre").count,24);shot("rn-rapid-input")
    }
    func testSelectionInvalidReleaseAndNextGesture(){
        app.buttons["producer1"].tap();app.buttons["producer1"].tap()
        let pair=cells(named:"Buğday başağı"), first=pair[0], second=pair[1]
        cell(first).tap()
        XCTAssertEqual(cell(first).value as? String,"Seçili")
        XCTAssertEqual(cell(second).value as? String,"")
        let frame=cell(first).frame;XCTAssertEqual(frame.width/frame.height,1.0,accuracy:0.015)
        cell(first).coordinate(withNormalizedOffset:CGVector(dx:0.5,dy:0.5)).press(forDuration:0.1,thenDragTo:app.coordinate(withNormalizedOffset:CGVector(dx:0,dy:0)).withOffset(CGVector(dx:2,dy:frame.midY)))
        XCTAssertEqual(cell(first).label,"Buğday başağı");energy("98");drag(first,second);XCTAssertEqual(cell(second).label,"Buğday demeti");shot("rn-selection-and-merge")
    }
    func testFullScreenPagesAndStorage(){
        app.buttons["producer1"].tap();let index=cells(named:"Buğday başağı")[0];cell(index).press(forDuration:0.6)
        XCTAssertTrue(app.buttons["storeSelected"].waitForExistence(timeout:5));app.buttons["storeSelected"].tap();XCTAssertEqual(cell(index).label,"Boş hücre")
        for tab in ["collection","cities","storage","market"] {
            app.buttons["tab-"+tab].tap();XCTAssertTrue(app.buttons["closePage"].waitForExistence(timeout:5));XCTAssertLessThan(app.buttons["closePage"].frame.midY,app.frame.height*0.2);XCTAssertGreaterThan(app.scrollViews.firstMatch.frame.height,app.frame.height*0.6);shot("rn-"+tab);app.buttons["closePage"].tap()
        }
        app.buttons["tab-storage"].tap();app.buttons["storage-0"].tap();app.buttons["closePage"].tap();XCTAssertEqual(cells(named:"Buğday başağı").count,1)
    }
    func testUnifiedParchmentPageGeometry(){
        app.open(URL(string:"masterland://review")!)
        XCTAssertTrue(app.buttons["producer1"].waitForExistence(timeout:10))
        var header:CGRect? = nil
        for tab in ["collection","storage","market","cities"] {
            app.buttons["tab-"+tab].tap()
            let close=app.buttons["closePage"]
            XCTAssertTrue(close.waitForExistence(timeout:5))
            if let reference=header {
                XCTAssertEqual(close.frame.minX,reference.minX,accuracy:0.5)
                XCTAssertEqual(close.frame.minY,reference.minY,accuracy:0.5)
            } else {header=close.frame}
            let body=app.descendants(matching:.any).matching(identifier:"pageContent").firstMatch.frame
            XCTAssertGreaterThanOrEqual(body.minX,app.frame.minX+(tab == "cities" ? 8 : 25))
            XCTAssertLessThanOrEqual(body.maxX,app.frame.maxX-(tab == "cities" ? 8 : 25))
            XCTAssertLessThan(body.maxY,app.frame.maxY-35)
            shot("unified-"+tab)
            if tab == "cities" {
                let route=app.descendants(matching:.any).matching(identifier:"cityRouteScroll").firstMatch.frame
                XCTAssertGreaterThanOrEqual(route.minX,body.minX)
                XCTAssertLessThanOrEqual(route.maxX,body.maxX)
                XCTAssertLessThanOrEqual(route.maxY,body.maxY-1)
                app.buttons["achievement-achievement3"].tap()
                XCTAssertTrue(app.buttons["returnToRoute"].waitForExistence(timeout:5))
                XCTAssertEqual(app.buttons["closePage"].frame.minY,header!.minY,accuracy:0.5)
                shot("unified-achievement")
                app.buttons["returnToRoute"].tap()
            }
            app.buttons["closePage"].tap()
        }
    }
    func testColdLaunchReachesBoardWithoutSplashStall(){
        app.terminate();app.launch()
        XCTAssertTrue(app.buttons["producer1"].waitForExistence(timeout:10))
        XCTAssertFalse(app.otherElements["launchScreen"].exists)
        XCTAssertTrue(app.buttons["producer1"].isHittable)
        shot("skara-cold-launch")
    }
    func testLoadingAndProducerConceptScreens(){
        app.open(URL(string:"masterland://loading-review")!)
        XCTAssertTrue(app.buttons["continueLoadingReview"].waitForExistence(timeout:10));shot("skara-loading-live")
        app.buttons["continueLoadingReview"].tap()
        XCTAssertTrue(app.buttons["producer1"].waitForExistence(timeout:10))
        app.buttons["producer1"].press(forDuration:0.6);app.buttons["powerProductDetails"].tap()
        XCTAssertTrue(app.buttons["unlock-item27"].waitForExistence(timeout:5));shot("skara-producer-live")
        app.buttons["unlock-item27"].tap();XCTAssertTrue(app.buttons["unlock-item49"].waitForExistence(timeout:5))
        app.buttons["closePage"].tap();app.buttons["tab-collection"].tap();shot("skara-collection-live")
    }
    func testGeometryAndScrollableOrders(){
        XCTAssertFalse(app.buttons["producerRailPrev"].exists)
        XCTAssertFalse(app.buttons["producerRailNext"].exists)
        app.buttons["allOrders"].tap();XCTAssertTrue(app.buttons["closePage"].waitForExistence(timeout:5));app.buttons["closePage"].tap()
        let first=cell(0).frame,last=cell(53).frame
        XCTAssertEqual(first.width/first.height,1.0,accuracy:0.015);XCTAssertEqual(first.width,last.width,accuracy:0.5);XCTAssertEqual(first.height,last.height,accuracy:0.5);XCTAssertLessThan(last.maxY,app.buttons["tab-board"].frame.minY)
        let a=app.buttons["order-quest25"].frame,b=app.buttons["order-city1-repeat-0-0"].frame;XCTAssertEqual(a.width,b.width,accuracy:0.5)
        let end=app.buttons["order-city1-repeat-0-4"];for _ in 0..<3 where !end.isHittable {app.scrollViews.allElementsBoundByIndex.first(where:{$0.frame.minY<=a.midY && $0.frame.maxY>=a.midY})!.swipeLeft()};XCTAssertTrue(end.isHittable);shot("rn-geometry")
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
        let cellFrames=(0..<54).map {cell($0).frame}
        values["cells"]=cellFrames.map { ["x":$0.minX,"y":$0.minY,"width":$0.width,"height":$0.height] }
        let data=try JSONSerialization.data(withJSONObject:values,options:[.prettyPrinted,.sortedKeys])
        let attachment=XCTAttachment(data:data,uniformTypeIdentifier:"public.json");attachment.name="visual-measurements.json";attachment.lifetime = .keepAlways;add(attachment)
        shot("masterland-v11-measured")
        for frame in cellFrames { XCTAssertEqual(frame.width,frame.height,accuracy:0.5); XCTAssertEqual(frame.width,cellFrames[0].width,accuracy:0.5) }
        XCTAssertEqual(cell(0).frame.width,cell(53).frame.width,accuracy:0.5)
        XCTAssertEqual(cell(0).frame.height,cell(53).frame.height,accuracy:0.5)
        XCTAssertEqual(cell(0).frame.width/cell(0).frame.height,1.0,accuracy:0.015)
        XCTAssertGreaterThanOrEqual(cell(0).frame.width,44)
        XCTAssertGreaterThanOrEqual(cell(0).frame.height,44)
    }

    func testSoundSettingDoesNotResetBoard(){
        app.buttons["producer1"].tap();energy("99")
        app.buttons["profile-menu"].tap();XCTAssertTrue(app.switches["setting-sound"].waitForExistence(timeout:5));app.switches["setting-sound"].tap();app.buttons["closePage"].tap()
        XCTAssertEqual(cells(named:"Buğday başağı").count,1);energy("99")
        app.buttons["profile-menu"].tap();app.switches["setting-sound"].tap();app.buttons["closePage"].tap()
        app.buttons["producer1"].tap();energy("98");mergePair("Buğday başağı");XCTAssertEqual(cells(named:"Buğday demeti").count,1);shot("sound-settings-preserve-board")
    }

    func milestone() {
        app.open(URL(string:"masterland://milestone-review")!)
        XCTAssertTrue(app.buttons["producer1"].waitForExistence(timeout:10))
    }
    func testMilestoneEnergyAndGuide() {
        milestone(); energy("90")
        app.buttons["testEnergyFill"].tap(); energy("100")
        app.buttons["stamina"].tap()
        XCTAssertTrue(app.buttons["upgradeEnergyCapacity"].waitForExistence(timeout:5))
        app.buttons["upgradeEnergyCapacity"].tap(); app.buttons["closePage"].tap(); energy("125")
        XCTAssertTrue(app.buttons["gems"].label.contains("9"))
        // Ready cards sort first; reveal the incomplete orders at the end of the rail.
        app.scrollViews.allElementsBoundByIndex.first(where: { $0.frame.height < 100 && $0.frame.minY > 100 })!.swipeLeft()
        let missing=app.buttons.matching(NSPredicate(format:"identifier BEGINSWITH 'order-' AND NOT label CONTAINS 'Hazır'" )).firstMatch
        if missing.exists { missing.tap() }
        else { app.buttons["tab-orders"].tap() }
        XCTAssertTrue(app.descendants(matching:.any).matching(identifier:"orderGuide").firstMatch.waitForExistence(timeout:5))
        shot("milestone-order-production-guide")
    }
    func testMilestoneCityRoundTrip() {
        milestone()
        app.buttons["tab-cities"].tap(); app.buttons["jump-city2"].tap()
        XCTAssertTrue(app.buttons["jump-city2"].isSelected)
        XCTAssertTrue(app.buttons["travelCity"].label.contains("6000"))
        app.buttons["travelCity"].tap()
        XCTAssertTrue(app.buttons["producer10"].waitForExistence(timeout:5))
        XCTAssertTrue(app.buttons["gold"].label.contains("2.000"))
        app.buttons["producer10"].tap(); XCTAssertEqual(cells(named:"Vanilyalı bisküvi").count,1)
        shot("milestone-haven-board")
        app.buttons["tab-collection"].tap();shot("milestone-haven-collection");app.buttons["closePage"].tap()
        app.buttons["tab-cities"].tap();app.buttons["jump-city1"].tap();app.buttons["travelCity"].tap()
        XCTAssertTrue(app.buttons["producer1"].waitForExistence(timeout:5));XCTAssertEqual(cell(0).label,"Buğday başağı")
        app.buttons["tab-cities"].tap();app.buttons["jump-city2"].tap();app.buttons["travelCity"].tap()
        XCTAssertEqual(cells(named:"Vanilyalı bisküvi").count,1)
        XCTAssertTrue(app.buttons["gold"].label.contains("2.005"))
    }
    func testMilestoneCelebrationAndCollection() {
        app.buttons["producer1"].tap()
        XCTAssertTrue(app.descendants(matching:.any).matching(identifier:"rewardCelebration").firstMatch.waitForExistence(timeout:5))
        shot("milestone-discovery-notice")
        app.buttons["producer1"].tap();drag(0,1);app.buttons["order-quest25"].tap()
        XCTAssertTrue(app.buttons["dismissReward"].waitForExistence(timeout:8))
        shot("milestone-level-celebration");app.buttons["dismissReward"].tap()
        XCTAssertTrue(app.buttons["producer1"].isHittable)
        app.buttons["tab-collection"].tap();shot("milestone-expanded-collection")
    }
    func testMilestoneStoreKitPurchase() throws {
        app.terminate()
        let session=try SKTestSession(configurationFileNamed:"Masterland")
        session.disableDialogs=true;session.clearTransactions()
        milestone();app.buttons["tab-market"].tap()
        let page=app.scrollViews.firstMatch
        page.swipeUp();page.swipeUp()
        let buy=app.buttons["com.erditaskin.masterland.gems30"]
        XCTAssertTrue(buy.waitForExistence(timeout:10))
        let loaded=XCTNSPredicateExpectation(predicate:NSPredicate {_,_ in buy.label.contains("Test satın al")},object:nil)
        XCTAssertEqual(XCTWaiter.wait(for:[loaded],timeout:15),.completed)
        buy.tap()
        let credited=app.buttons["dismissReward"].waitForExistence(timeout:30)
        shot("milestone-storekit-result")
        XCTAssertTrue(credited,app.debugDescription)
        shot("milestone-storekit-credited");app.buttons["dismissReward"].tap()
        XCTAssertTrue(app.buttons["gems"].label.contains("42"))
    }

    func testMilestoneMarketExchangesAndAchievement() {
        milestone();app.buttons["tab-market"].tap()
        app.buttons["exchange-energy25"].tap();energy("115");XCTAssertTrue(app.buttons["gems"].label.contains("9"))
        app.buttons["exchange-gold500"].tap();XCTAssertTrue(app.buttons["gold"].label.contains("8.500"));XCTAssertTrue(app.buttons["gems"].label.contains("4"))
        app.buttons["exchange-energy100"].tap();energy("115");XCTAssertTrue(app.buttons["gems"].label.contains("4"))
        shot("milestone-game-market")
        app.buttons["closePage"].tap();app.buttons["tab-cities"].tap();app.buttons["achievement-achievement1"].tap()
        app.buttons["claimAchievement"].tap();XCTAssertTrue(app.buttons["dismissReward"].waitForExistence(timeout:5));shot("milestone-custom-achievement")
        app.buttons["dismissReward"].tap();XCTAssertFalse(app.buttons["claimAchievement"].exists)
    }

    func testTestFlightBetaPurchasePolicy() {
        XCTAssertTrue(app.buttons["testEnergyFill"].exists)
        let before=app.buttons["profile"].label
        app.open(URL(string:"masterland://milestone-review")!)
        XCTAssertEqual(app.buttons["profile"].label,before)
        app.buttons["testEnergyFill"].tap();energy("100")
        app.buttons["tab-market"].tap()
        let scroll=app.scrollViews.firstMatch;scroll.swipeUp();scroll.swipeUp()
        XCTAssertFalse(app.buttons["com.erditaskin.masterland.gems30"].exists)
        XCTAssertFalse(app.buttons["com.erditaskin.masterland.gold2500"].exists)
        XCTAssertTrue(app.staticTexts.containing(NSPredicate(format:"label CONTAINS 'Bu betada gerçek para'")).firstMatch.exists)
        shot("testflight-beta-purchases-disabled")
    }

}
