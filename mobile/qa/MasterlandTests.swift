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
    func cells(named name:String)->[Int] {(0..<63).filter {cell($0).exists && cell($0).label == name}}
    func mergePair(_ name:String) {
        let pair=cells(named:name);XCTAssertGreaterThanOrEqual(pair.count,2)
        guard pair.count>=2 else {return};drag(pair[0],pair[1])
    }
    func drag(_ a:Int,_ b:Int){cell(a).press(forDuration:0.1,thenDragTo:cell(b))}
    func energy(_ expected:String){XCTAssertTrue(app.buttons["stamina"].label.contains(expected),app.buttons["stamina"].label)}
    func shot(_ name:String){let a=XCTAttachment(screenshot:app.screenshot());a.name=name;a.lifetime = .keepAlways;add(a)}
    func testThemedDetailScreensRemainNavigable() {
        app.open(URL(string:"masterland://review")!)
        app.buttons["tab-collection"].tap()
        app.buttons["collection-producer-producer1"].tap()
        XCTAssertTrue(app.buttons["viewProducerFromCollection"].waitForExistence(timeout:5))
        XCTAssertTrue(app.buttons["tab-collection"].isSelected)
        shot("theme-belenyaka-collection-chain")
        app.buttons["viewProducerFromCollection"].tap()
        XCTAssertTrue(app.buttons["closePage"].waitForExistence(timeout:5))
        XCTAssertTrue(app.buttons["tab-board"].isSelected)
        app.buttons["closePage"].tap()
        app.buttons["producer5"].tap()
        XCTAssertTrue(app.buttons["refillProducerGems"].waitForExistence(timeout:5))
        shot("theme-belenyaka-producer-cooldown")
        app.buttons["closePage"].tap()
        app.buttons["allOrders"].tap()
        XCTAssertTrue(app.buttons["closePage"].waitForExistence(timeout:5))
        shot("theme-belenyaka-orders")
        let guide=app.buttons["order-detail-city1-repeat-1-4"]
        for _ in 0..<4 {if guide.isHittable {break};app.swipeUp()}
        XCTAssertTrue(guide.isHittable)
        guide.tap()
        XCTAssertTrue(app.otherElements["orderGuide"].waitForExistence(timeout:5))
        shot("theme-belenyaka-order-guide")
        app.buttons["closePage"].tap()
        app.buttons["tab-cities"].tap()
        let list=app.buttons["openCityAchievements"]
        for _ in 0..<4 {if list.isHittable {break};app.swipeUp()}
        XCTAssertTrue(list.isHittable)
        list.tap()
        let achievement=app.buttons["achievement-achievement3"]
        for _ in 0..<3 {if achievement.isHittable {break};app.swipeUp()}
        XCTAssertTrue(achievement.isHittable)
        shot("theme-belenyaka-achievement-list")
        achievement.tap()
        XCTAssertTrue(app.buttons["returnToRoute"].waitForExistence(timeout:5))
        shot("theme-belenyaka-achievement-detail")
        let back=app.buttons["returnToRoute"]
        if !back.isHittable {app.swipeUp()}
        back.tap()
        XCTAssertTrue(app.buttons["achievement-achievement3"].waitForExistence(timeout:5))
    }
    func testFiveCityMaterialPreviewsKeepGameplayAndSquareGeometry() {
        for (id,name) in [("city1","Belenyaka"),("city2","Badınca"),("city3","Yalıkoru"),("city4","Demirdere"),("city5","İpekyolu")] {
            app.open(URL(string:"masterland://city-theme-review/"+id)!)
            let marker=app.staticTexts["visualReviewMarker"]
            XCTAssertTrue(marker.waitForExistence(timeout:10))
            let ready=XCTNSPredicateExpectation(predicate:NSPredicate { _,_ in
                id == "city1" ? marker.label == "Görsel inceleme" : marker.label.contains(name)
            },object:nil)
            XCTAssertEqual(XCTWaiter.wait(for:[ready],timeout:10),.completed)
            XCTAssertEqual(cell(0).frame.height,cell(53).frame.height,accuracy:0.01)
            XCTAssertEqual(cell(0).frame.width,cell(53).frame.width,accuracy:0.01)
            XCTAssertTrue(app.buttons["gold"].label.contains("750"))
            shot("theme-"+id+"-board")
            for tab in ["collection","storage","market","cities"] {
                app.buttons["tab-"+tab].tap()
                XCTAssertTrue(app.buttons["closePage"].waitForExistence(timeout:5))
                XCTAssertTrue(app.buttons["tab-"+tab].isSelected)
                shot("theme-"+id+"-"+tab)
                app.buttons["closePage"].tap()
            }
            XCTAssertTrue(app.buttons["gold"].label.contains("750"))
        }
    }
    func testCityThemeCompositePagesAndStorage() {
        app.open(URL(string:"masterland://review")!)
        XCTAssertTrue(app.buttons["producer1"].waitForExistence(timeout:10))
        shot("theme-belenyaka-board")
        for tab in ["collection","storage","market","cities"] {
            app.buttons["tab-"+tab].tap()
            let close=app.buttons["closePage"]
            XCTAssertTrue(close.waitForExistence(timeout:5))
            XCTAssertTrue(close.isHittable)
            XCTAssertTrue(app.frame.contains(close.frame))
            XCTAssertTrue(app.buttons["tab-"+tab].isHittable)
            XCTAssertTrue(app.buttons["tab-"+tab].isSelected)
            shot("theme-belenyaka-"+tab)
            if tab == "cities" {
                for id in ["city1","city2","city3"] { XCTAssertTrue(app.buttons["jump-"+id].exists) }
                app.swipeUp()
                XCTAssertTrue(app.buttons["jump-city5"].waitForExistence(timeout:5))
                shot("theme-first-five-city-list")
            }
            close.tap()
        }
        app.buttons["profile-menu"].tap()
        XCTAssertTrue(app.otherElements["accountPanel"].waitForExistence(timeout:5))
        shot("theme-belenyaka-account-guest")
        app.buttons["closePage"].tap()
        app.open(URL(string:"masterland://qa-reset")!)
        XCTAssertTrue(app.buttons["producer1"].waitForExistence(timeout:5))
        app.buttons["producer1"].tap()
        let index=cells(named:"Buğday başağı")[0]
        cell(index).press(forDuration:0.6)
        XCTAssertTrue(app.buttons["storeSelected"].waitForExistence(timeout:5))
        shot("theme-belenyaka-item")
        app.buttons["storeSelected"].tap()
        app.buttons["tab-storage"].tap()
        app.buttons["storage-0"].tap()
        let restore=app.buttons["restoreSelected"]
        if !restore.isHittable {app.swipeUp()}
        XCTAssertTrue(restore.waitForExistence(timeout:5))
        shot("theme-belenyaka-storage-selected")
        restore.tap()
        app.buttons["closePage"].tap()
        XCTAssertEqual(cells(named:"Buğday başağı").count,1)
        XCTAssertEqual(cell(0).frame.width,cell(0).frame.height,accuracy:0.01)
    }
    func testGameplayRefreshIdleCooldownAndFreeMerge() {
        XCTAssertTrue(app.descendants(matching:.any).matching(identifier:"idleHint").firstMatch.waitForExistence(timeout:8))
        app.buttons["producer1"].tap()
        app.buttons["producer1"].tap()
        mergePair("Buğday başağı")
        app.buttons["producer1"].tap();app.buttons["producer1"].tap()
        mergePair("Buğday başağı")
        mergePair("Buğday demeti")
        XCTAssertEqual(cells(named:"Tahıl çuvalı").count,1)
        shot("free-merge-discovery")
        app.open(URL(string:"masterland://review")!)
        XCTAssertTrue(app.buttons["producer5"].waitForExistence(timeout:5))
        app.buttons["producer5"].tap()
        XCTAssertTrue(app.descendants(matching:.any).matching(identifier:"producerCooldown").firstMatch.waitForExistence(timeout:5))
        XCTAssertTrue(app.buttons["refillProducerGems"].exists)
        XCTAssertTrue(app.buttons["watchProducerAd"].exists)
        shot("producer-cooldown-options")
        app.buttons["refillProducerGems"].tap()
        XCTAssertFalse(app.descendants(matching:.any).matching(identifier:"producerCooldown").firstMatch.exists)
        app.buttons["closePage"].tap()
        app.buttons["producer5"].tap()
        shot("producer-refreshed")
    }
    func testCityCatalogAndAuthRefreshPreserveBoard() {
        let board=cell(0).frame, gold=app.buttons["gold"].label
        app.buttons["tab-cities"].tap()
        XCTAssertTrue(app.buttons["jump-city1"].waitForExistence(timeout:5))
        XCTAssertTrue(app.buttons["jump-city1"].isSelected)
        XCTAssertTrue(app.buttons["jump-city1"].label.contains("Belenyaka"))
        app.buttons["jump-city2"].tap()
        XCTAssertTrue(app.buttons["jump-city2"].isSelected)
        XCTAssertFalse(app.buttons["jump-city1"].isSelected)
        shot("city-catalog-badinca")
        app.buttons["jump-city3"].tap()
        XCTAssertTrue(app.buttons["jump-city3"].isSelected)
        XCTAssertFalse(app.buttons["travelCity"].isEnabled)
        shot("city-catalog-yalikoru")
        app.buttons["jump-city1"].tap()
        shot("city-catalog-belenyaka")
        app.buttons["travelCity"].tap()
        XCTAssertEqual(cell(0).frame,board)
        XCTAssertEqual(app.buttons["gold"].label,gold)
        app.buttons["profile-menu"].tap()
        XCTAssertTrue(app.descendants(matching:.any).matching(identifier:"accountPanel").firstMatch.waitForExistence(timeout:5))
        XCTAssertEqual(app.buttons["signInGoogle"].frame.width,app.buttons["signInFacebook"].frame.width,accuracy:1)
        XCTAssertGreaterThan(app.buttons["signInGoogle"].frame.width,250)
        shot("auth-page-refreshed")
        app.buttons["closeAccount"].tap()
        XCTAssertEqual(cell(0).frame,board)
        shot("belenyaka-board-refresh")
    }
    func testDeletionRecoveryKeepsRetryInsideParchment() {
        app.open(URL(string:"masterland://deletion-recovery-review")!)
        let panel=app.descendants(matching:.any).matching(identifier:"deletionRecovery").firstMatch
        XCTAssertTrue(panel.waitForExistence(timeout:10))
        let retry=app.buttons["retryDeletionRecovery"]
        XCTAssertTrue(retry.isHittable)
        XCTAssertTrue(panel.frame.contains(retry.frame))
        shot("deletion-offline-recovery-parchment")
        app.open(URL(string:"masterland://qa-reset")!)
        XCTAssertFalse(panel.exists)
    }
    func testControlledAcceptanceHasNoCheatsAndOnlyPreviewAds() {
        for id in ["testEnergyFill","testGoldAdd","testGemsAdd","testLevelUp"] { XCTAssertFalse(app.buttons[id].exists) }
        app.buttons["stamina"].tap()
        XCTAssertTrue(app.descendants(matching:.any).matching(identifier:"energyAdPanel").firstMatch.waitForExistence(timeout:5))
        XCTAssertTrue(app.staticTexts.containing(NSPredicate(format:"label CONTAINS %@","Bakiye ve günlük hak değişmez")).firstMatch.exists)
        let watch=app.buttons["watchEnergyAd"]
        XCTAssertTrue(watch.label.contains("ödülsüz"))
        let beforeEnergy=app.buttons["stamina"].label
        shot("controlled-testflight-test-ad-preview")
        watch.tap()
        let presented=XCTNSPredicateExpectation(predicate:NSPredicate { _,_ in self.app.buttons["Close Advertisement"].exists || self.app.buttons["Close"].exists },object:nil)
        XCTAssertEqual(XCTWaiter.wait(for:[presented],timeout:45),.completed)
        sleep(35)
        let endClose=app.buttons["Close"].firstMatch, videoClose=app.buttons["Close Advertisement"].firstMatch
        if endClose.waitForExistence(timeout:5) && endClose.isHittable {endClose.tap()}
        else if videoClose.isEnabled {videoClose.tap();if endClose.waitForExistence(timeout:5) && endClose.isHittable {endClose.tap()}}
        XCTAssertTrue(app.staticTexts.containing(NSPredicate(format:"label CONTAINS %@","Bu önizleme ödül vermez")).firstMatch.waitForExistence(timeout:10))
        shot("controlled-preview-completed-without-reward")
        app.buttons["closePage"].tap()
        XCTAssertEqual(app.buttons["stamina"].label,beforeEnergy)
        XCTAssertTrue(app.buttons["stamina"].exists)
        shot("controlled-testflight-no-cheats")
    }
    func testRewardedTestInventoryLoadsOnlyOnExplicitEnergyAction() {
        // Use the simulator's persistent test-mode save, not the ephemeral qa-reset fixture.
        app.terminate()
        app.launch()
        XCTAssertTrue(app.buttons["stamina"].waitForExistence(timeout:20))
        app.buttons["testEnergyFill"].tap()
        let expectedEnergy=String((Int(app.buttons["stamina"].label) ?? 100)+25)
        app.buttons["stamina"].tap()
        XCTAssertTrue(app.descendants(matching:.any).matching(identifier:"energyAdPanel").firstMatch.waitForExistence(timeout:5))
        let watch=app.buttons["watchEnergyAd"]
        XCTAssertTrue(watch.isHittable)
        watch.tap()
        let presented=XCTNSPredicateExpectation(predicate:NSPredicate { _,_ in self.app.buttons["Close Advertisement"].exists || self.app.buttons["Close"].exists },object:nil)
        XCTAssertEqual(XCTWaiter.wait(for:[presented],timeout:45),.completed)
        sleep(3)
        shot("rewarded-test-inventory-presented")
        sleep(32)
        let endCardClose=app.buttons["Close"].firstMatch
        let videoClose=app.buttons["Close Advertisement"].firstMatch
        if endCardClose.waitForExistence(timeout:5) && endCardClose.isHittable { endCardClose.tap() }
        else if videoClose.isEnabled { videoClose.tap(); if endCardClose.waitForExistence(timeout:5) && endCardClose.isHittable { endCardClose.tap() } }
        shot("rewarded-after-dismiss")
        XCTAssertTrue(app.buttons["closePage"].waitForExistence(timeout:10))
        app.buttons["closePage"].tap()
        let reward=XCTNSPredicateExpectation(predicate:NSPredicate { _,_ in self.app.buttons["stamina"].exists && self.app.buttons["stamina"].label == expectedEnergy },object:nil)
        XCTAssertEqual(XCTWaiter.wait(for:[reward],timeout:10),.completed)
        shot("rewarded-earned-twenty-five-energy")
        app.terminate()
        app.launch()
        XCTAssertTrue(app.buttons["stamina"].waitForExistence(timeout:15))
        XCTAssertEqual(app.buttons["stamina"].label,expectedEnergy)
        app.buttons["stamina"].tap()
        XCTAssertTrue(app.staticTexts.containing(NSPredicate(format:"label CONTAINS %@","1/4")).firstMatch.exists)
        shot("rewarded-energy-and-quota-persisted")
    }
    func dismissVerifiedTestAd() {
        let endClose=app.buttons["Close"].firstMatch, videoClose=app.buttons["Close Advertisement"].firstMatch
        let earned=app.staticTexts["Reward granted"].firstMatch
        let dismissable=XCTNSPredicateExpectation(predicate:NSPredicate { _,_ in
            (endClose.exists && endClose.isEnabled && endClose.isHittable) ||
            (videoClose.exists && videoClose.isEnabled && videoClose.isHittable) || earned.exists
        },object:nil)
        XCTAssertEqual(XCTWaiter.wait(for:[dismissable],timeout:180),.completed)
        if endClose.exists && endClose.isEnabled && endClose.isHittable {endClose.tap()}
        else if videoClose.isEnabled {videoClose.tap();if endClose.waitForExistence(timeout:5) && endClose.isHittable {endClose.tap()}}
        else {
            // The observed Google two-ad test creative draws X immediately right of this label,
            // while exposing only a disabled placeholder close button to XCTest accessibility.
            XCTAssertTrue(earned.exists)
            earned.coordinate(withNormalizedOffset:CGVector(dx:1,dy:0.5)).withOffset(CGVector(dx:18,dy:0)).tap()
        }
        XCTAssertTrue(app.buttons["closePage"].waitForExistence(timeout:20))
    }
    func testVerifiedEnergySSVEndToEnd() {
        let before=Int(app.buttons["stamina"].label) ?? 100
        let expected=String(before+25)
        app.buttons["stamina"].tap()
        let watch=app.buttons["watchEnergyAd"]
        XCTAssertTrue(watch.waitForExistence(timeout:10))
        XCTAssertFalse(watch.label.contains("ödülsüz"))
        let ready=XCTNSPredicateExpectation(predicate:NSPredicate { _,_ in watch.exists && watch.isEnabled && watch.isHittable },object:nil)
        XCTAssertEqual(XCTWaiter.wait(for:[ready],timeout:45),.completed)
        watch.tap()
        let presented=XCTNSPredicateExpectation(predicate:NSPredicate { _,_ in self.app.buttons["Close Advertisement"].exists || self.app.buttons["Close"].exists },object:nil)
        XCTAssertEqual(XCTWaiter.wait(for:[presented],timeout:60),.completed)
        shot("verified-own-unit-test-ad-presented")
        dismissVerifiedTestAd()
        app.buttons["closePage"].tap()
        let credited=XCTNSPredicateExpectation(predicate:NSPredicate { _,_ in self.app.buttons["stamina"].label == expected },object:nil)
        XCTAssertEqual(XCTWaiter.wait(for:[credited],timeout:90),.completed)
        shot("verified-server-energy-credited")
        app.terminate();app.launch()
        XCTAssertTrue(app.buttons["stamina"].waitForExistence(timeout:20))
        XCTAssertEqual(app.buttons["stamina"].label,expected)
        shot("verified-server-energy-persisted")
    }
    func openGuestDeletionConfirmation() {
        app.buttons["profile-menu"].tap()
        XCTAssertTrue(app.descendants(matching:.any).matching(identifier:"accountPanel").firstMatch.waitForExistence(timeout:10))
        XCTAssertFalse(app.descendants(matching:.any).matching(identifier:"signedInAccount").firstMatch.exists)
        let open=app.buttons["openAccountDeletion"]
        for _ in 0..<4 where !open.isHittable {app.scrollViews.firstMatch.swipeUp()}
        XCTAssertTrue(open.isHittable);open.tap()
        XCTAssertTrue(app.descendants(matching:.any).matching(identifier:"accountDeletionConfirmation").firstMatch.waitForExistence(timeout:5))
    }
    func testPrepareGuestDeletionConfirmation() {
        openGuestDeletionConfirmation()
        let consent=app.descendants(matching:.any).matching(identifier:"confirmAccountDeletionConsent").firstMatch
        XCTAssertTrue(consent.exists)
        let erase=app.buttons["confirmAccountDeletion"]
        for _ in 0..<3 where !erase.isHittable {app.scrollViews.firstMatch.swipeUp()}
        XCTAssertTrue(erase.exists)
        XCTAssertFalse(erase.isEnabled)
        shot("guest-deletion-awaiting-explicit-approval")
    }
    func testApprovedGuestDeletionEndToEnd() throws {
        guard ProcessInfo.processInfo.environment["MASTERLAND_APPROVED_GUEST_DELETION"] == "true" else {
            throw XCTSkip("Explicit approval for the isolated Reward-Cancel-QA guest is required.")
        }
        // Run only after explicit approval for the isolated empty guest in Reward-Cancel-QA.
        app.buttons["producer1"].tap()
        XCTAssertEqual(app.buttons["stamina"].label,"99")
        if app.buttons["dismissReward"].exists {app.buttons["dismissReward"].tap()}
        openGuestDeletionConfirmation()
        let consent=app.descendants(matching:.any).matching(identifier:"confirmAccountDeletionConsent").firstMatch
        for _ in 0..<3 where !consent.isHittable {app.scrollViews.firstMatch.swipeUp()}
        XCTAssertTrue(consent.isHittable);consent.tap()
        let erase=app.buttons["confirmAccountDeletion"]
        for _ in 0..<3 where !erase.isHittable {app.scrollViews.firstMatch.swipeUp()}
        XCTAssertTrue(erase.isEnabled);erase.tap()
        let deleted=app.staticTexts.containing(NSPredicate(format:"label CONTAINS %@","Hesabın silindi")).firstMatch
        XCTAssertTrue(deleted.waitForExistence(timeout:40))
        shot("approved-guest-deletion-completed")
        if app.buttons["dismissReward"].exists {app.buttons["dismissReward"].tap()}
        if app.buttons["closeAccount"].exists {app.buttons["closeAccount"].tap()}
        XCTAssertEqual(app.buttons["stamina"].label,"100")
        app.terminate();app.launch()
        XCTAssertTrue(app.buttons["stamina"].waitForExistence(timeout:20))
        XCTAssertEqual(app.buttons["stamina"].label,"100")
        XCTAssertFalse(app.descendants(matching:.any).matching(identifier:"deletionRecovery").firstMatch.exists)
        app.buttons["profile-menu"].tap()
        XCTAssertTrue(app.descendants(matching:.any).matching(identifier:"accountPanel").firstMatch.waitForExistence(timeout:10))
        XCTAssertFalse(app.buttons["openAccountDeletion"].exists)
        shot("approved-guest-deletion-persists-after-relaunch")
    }
    func testVerifiedAbandonedAdNeverCredits() {
        XCTAssertEqual(app.buttons["stamina"].label,"100")
        app.buttons["stamina"].tap()
        let watch=app.buttons["watchEnergyAd"]
        XCTAssertTrue(watch.waitForExistence(timeout:10));watch.tap()
        let presented=XCTNSPredicateExpectation(predicate:NSPredicate { _,_ in self.app.buttons["Close Advertisement"].exists || self.app.buttons["Close"].exists },object:nil)
        XCTAssertEqual(XCTWaiter.wait(for:[presented],timeout:60),.completed)
        shot("verified-ad-abandoned-before-completion")
        XCUIDevice.shared.press(.home)
        sleep(5)
        app.terminate();app.launch()
        XCTAssertTrue(app.buttons["stamina"].waitForExistence(timeout:20))
        XCTAssertEqual(app.buttons["stamina"].label,"100")
        app.buttons["stamina"].tap()
        XCTAssertTrue(app.staticTexts.containing(NSPredicate(format:"label CONTAINS %@","0/4")).firstMatch.waitForExistence(timeout:10))
        shot("verified-abandoned-no-credit-no-daily-use")
    }
    func testVerifiedSharedDailyLimitPreventsFifthAd() {
        let before=Int(app.buttons["stamina"].label) ?? 0
        app.buttons["stamina"].tap()
        let watch=app.buttons["watchEnergyAd"]
        XCTAssertTrue(watch.waitForExistence(timeout:10))
        watch.tap()
        let limited=XCTNSPredicateExpectation(predicate:NSPredicate { _,_ in watch.exists && !watch.isEnabled && watch.label.contains("Bugünkü hediyeler tamamlandı") },object:nil)
        XCTAssertEqual(XCTWaiter.wait(for:[limited],timeout:30),.completed)
        XCTAssertTrue(app.staticTexts.containing(NSPredicate(format:"label CONTAINS %@","4/4")).firstMatch.exists)
        XCTAssertFalse(app.buttons["Close Advertisement"].exists)
        shot("verified-shared-four-per-day-no-fifth-ad")
        app.buttons["closePage"].tap()
        let after=Int(app.buttons["stamina"].label) ?? 0
        XCTAssertGreaterThanOrEqual(after,before)
        XCTAssertLessThanOrEqual(after,before+1)
    }
    func testVerifiedProducerSSVEndToEnd() {
        let producer=app.buttons["producer1"]
        producer.press(forDuration:0.8)
        XCTAssertTrue(app.buttons["power-1"].waitForExistence(timeout:10))
        app.buttons["power-1"].tap()
        for _ in 0..<81 {
            if app.descendants(matching:.any).matching(identifier:"producerCooldown").firstMatch.exists {break}
            if app.buttons["dismissReward"].exists {app.buttons["dismissReward"].tap()}
            producer.tap()
            let pair=app.descendants(matching:.any).matching(NSPredicate(format:"identifier BEGINSWITH %@ AND label == %@","cell-","Buğday başağı")).allElementsBoundByIndex
            if pair.count>=2 {pair[0].press(forDuration:0.1,thenDragTo:pair[1])}
        }
        let cooldown=app.descendants(matching:.any).matching(identifier:"producerCooldown").firstMatch
        XCTAssertTrue(cooldown.waitForExistence(timeout:10))
        let before=Int(app.buttons["stamina"].label) ?? 0, started=Date()
        let watch=app.buttons["watchProducerAd"]
        XCTAssertTrue(watch.waitForExistence(timeout:10));watch.tap()
        let presented=XCTNSPredicateExpectation(predicate:NSPredicate { _,_ in self.app.buttons["Close Advertisement"].exists || self.app.buttons["Close"].exists },object:nil)
        XCTAssertEqual(XCTWaiter.wait(for:[presented],timeout:60),.completed)
        dismissVerifiedTestAd()
        let refreshed=XCTNSPredicateExpectation(predicate:NSPredicate { _,_ in !cooldown.exists },object:nil)
        XCTAssertEqual(XCTWaiter.wait(for:[refreshed],timeout:90),.completed)
        let after=Int(app.buttons["stamina"].label) ?? 0
        let passiveMaximum=before>=100 ? before : min(100,before+Int(ceil(Date().timeIntervalSince(started)/120))+1)
        XCTAssertGreaterThanOrEqual(after,before)
        XCTAssertLessThanOrEqual(after,passiveMaximum)
        shot("verified-producer-ready-without-energy-reward")
        app.terminate();app.launch()
        XCTAssertTrue(app.buttons["producer1"].waitForExistence(timeout:20))
        producer.tap()
        XCTAssertFalse(cooldown.exists)
        shot("verified-producer-refresh-persisted")
    }
    func testRewardedProducerRefreshDoesNotGrantEnergy() {
        app.open(URL(string:"masterland://review")!)
        XCTAssertTrue(app.buttons["producer5"].waitForExistence(timeout:10))
        let beforeEnergy=app.buttons["stamina"].label
        app.buttons["producer5"].tap()
        XCTAssertTrue(app.descendants(matching:.any).matching(identifier:"producerCooldown").firstMatch.waitForExistence(timeout:5))
        let watch=app.buttons["watchProducerAd"]
        let prepared=XCTNSPredicateExpectation(predicate:NSPredicate { _,_ in watch.exists && watch.isEnabled && watch.isHittable },object:nil)
        XCTAssertEqual(XCTWaiter.wait(for:[prepared],timeout:35),.completed)
        watch.tap()
        let presented=XCTNSPredicateExpectation(predicate:NSPredicate { _,_ in self.app.buttons["Close Advertisement"].exists || self.app.buttons["Close"].exists },object:nil)
        XCTAssertEqual(XCTWaiter.wait(for:[presented],timeout:45),.completed)
        sleep(35)
        let endClose=app.buttons["Close"].firstMatch, videoClose=app.buttons["Close Advertisement"].firstMatch
        if endClose.waitForExistence(timeout:5) && endClose.isHittable {endClose.tap()}
        else if videoClose.isEnabled {videoClose.tap();if endClose.waitForExistence(timeout:5) && endClose.isHittable {endClose.tap()}}
        XCTAssertTrue(app.buttons["closePage"].waitForExistence(timeout:10))
        XCTAssertFalse(app.descendants(matching:.any).matching(identifier:"producerCooldown").firstMatch.exists)
        app.buttons["closePage"].tap()
        XCTAssertEqual(app.buttons["stamina"].label,beforeEnergy)
        shot("rewarded-producer-refreshed-without-energy")
        app.terminate()
    }
    func testOfflineAccountPanelAndContentLanguage() {
        let gold=app.buttons["gold"].label, xp=app.buttons["profile"].label, frame=cell(0).frame
        app.buttons["profile-menu"].tap()
        let panel=app.descendants(matching:.any).matching(identifier:"accountPanel").firstMatch
        XCTAssertTrue(panel.waitForExistence(timeout:5))
        XCTAssertTrue(app.buttons["signInGoogle"].exists);XCTAssertFalse(app.buttons["signInGoogle"].isEnabled)
        XCTAssertTrue(app.buttons["signInFacebook"].exists);XCTAssertFalse(app.buttons["signInFacebook"].isEnabled)
        XCTAssertTrue(app.staticTexts["Cihazda kayıtlı"].exists)
        let english=app.buttons["language-en"]
        if !english.isHittable {app.scrollViews.firstMatch.swipeUp()}
        english.tap()
        XCTAssertTrue(app.staticTexts["Sign in"].waitForExistence(timeout:5))
        shot("account-offline-english-preview")
        app.buttons["closeAccount"].tap()
        XCTAssertFalse(panel.exists)
        XCTAssertTrue(app.buttons["producer1"].label.contains("Wheat Field"))
        XCTAssertEqual(app.buttons["gold"].label,gold);XCTAssertEqual(app.buttons["profile"].label.components(separatedBy:CharacterSet.decimalDigits.inverted).filter {!$0.isEmpty},xp.components(separatedBy:CharacterSet.decimalDigits.inverted).filter {!$0.isEmpty})
        XCTAssertEqual(cell(0).frame,frame)
        shot("english-board")
        for tab in ["collection","cities","market"] {
            app.buttons["tab-"+tab].tap()
            XCTAssertTrue(app.buttons["closePage"].waitForExistence(timeout:5))
            shot("english-"+tab)
            app.buttons["closePage"].tap()
        }
        app.buttons["profile-menu"].tap()
        if !app.buttons["language-tr"].isHittable {app.scrollViews.firstMatch.swipeUp()}
        app.buttons["language-tr"].tap();app.buttons["closePage"].tap()
        XCTAssertTrue(app.buttons["producer1"].label.contains("Buğday Tarlası"))
        shot("account-language-restored")
    }
    func testDebugLevelButtonAddsOneLevelPerPress() {
        XCTAssertTrue(app.buttons["profile"].label.contains("Seviye 1,"))
        app.buttons["testLevelUp"].tap()
        XCTAssertTrue(app.buttons["profile"].label.contains("Seviye 2,"))
        XCTAssertTrue(app.buttons["dismissReward"].waitForExistence(timeout:5))
        app.buttons["dismissReward"].tap()
        app.buttons["testLevelUp"].tap()
        XCTAssertTrue(app.buttons["profile"].label.contains("Seviye 3,"))
        app.buttons["dismissReward"].tap()
        let buttons=["testEnergyFill","testGoldAdd","testGemsAdd","testLevelUp"].map {app.buttons[$0]}
        for button in buttons {XCTAssertTrue(button.isHittable)}
        for i in 0..<3 {XCTAssertLessThanOrEqual(buttons[i].frame.maxX,buttons[i+1].frame.minX)}
        shot("four-debug-buttons-level-three")
    }
    func testReadyIconPulseAndMapAlignment() {
        app.open(URL(string:"masterland://review")!)
        XCTAssertTrue(app.buttons["order-quest26"].waitForExistence(timeout:10))
        let icon=app.descendants(matching:.any).matching(identifier:"ready-icon-cell-3").firstMatch
        XCTAssertTrue(icon.waitForExistence(timeout:5))
        let cellFrame=cell(3).frame
        var widths:[CGFloat]=[]
        for _ in 0..<12 {widths.append(icon.frame.width)}
        XCTAssertGreaterThan(widths.max()!-widths.min()!,0.2)
        XCTAssertLessThanOrEqual(widths.max()!/widths.min()!,1.055)
        XCTAssertEqual(cellFrame,cell(3).frame)
        shot("ready-icon-pulse")
        app.buttons["profile-menu"].tap()
        app.descendants(matching:.any).matching(identifier:"setting-motion").firstMatch.tap()
        app.buttons["closePage"].tap()
        var still:[CGFloat]=[]
        for _ in 0..<5 {still.append(icon.frame.width)}
        XCTAssertLessThan(still.max()!-still.min()!,0.2)
        app.buttons["tab-cities"].tap()
        let firstCity=app.buttons["jump-city1"]
        XCTAssertTrue(firstCity.waitForExistence(timeout:5))
        XCTAssertTrue(firstCity.isHittable)
        XCTAssertGreaterThanOrEqual(firstCity.frame.minX,app.frame.minX)
        XCTAssertLessThanOrEqual(firstCity.frame.maxX,app.frame.maxX)
        XCTAssertGreaterThanOrEqual(app.buttons["closePage"].frame.width,44)
        shot("map-aligned-return-and-close")
        app.buttons["closePage"].tap();app.buttons["tab-collection"].tap()
        shot("smaller-collection-icons")
    }
    func testDebugWalletAndParchmentControls() {
        let first=cell(0).frame
        XCTAssertTrue(app.buttons["testGoldAdd"].exists);XCTAssertTrue(app.buttons["testGemsAdd"].exists)
        app.buttons["testGoldAdd"].tap();app.buttons["testGoldAdd"].tap()
        XCTAssertEqual(app.buttons["gold"].label,"20.000")
        app.buttons["testGemsAdd"].tap();app.buttons["testGemsAdd"].tap()
        XCTAssertEqual(app.buttons["gems"].label,"200")
        let counters=["stamina","gold","gems"].map {app.buttons[$0].frame}
        for counter in counters {
            XCTAssertEqual(counter.height,counters[0].height,accuracy:0.5)
            XCTAssertEqual(counter.width,counters[0].width,accuracy:0.5)
            XCTAssertEqual(counter.midY,counters[0].midY,accuracy:0.5)
        }
        XCTAssertGreaterThanOrEqual(app.buttons["producer1"].frame.width,52)
        XCTAssertEqual(first,cell(0).frame)
        shot("debug-wallet-aligned-hud")
        app.buttons["profile-menu"].tap()
        let check=app.descendants(matching:.any).matching(identifier:"setting-sound").firstMatch
        XCTAssertTrue(check.waitForExistence(timeout:5));let previous=check.value as? String
        check.tap();XCTAssertNotEqual(check.value as? String,previous)
        app.descendants(matching:.any).matching(identifier:"setting-motion").firstMatch.tap()
        shot("parchment-profile-checkboxes")
        app.buttons["closePage"].tap()
        app.buttons["tab-cities"].tap();app.buttons["jump-city2"].tap()
        XCTAssertGreaterThanOrEqual(app.buttons["travelCity"].frame.height,44)
        shot("parchment-haven-travel")
    }
    func testScatteredProductionAndCompactControls() {
        let initial = cell(0).frame
        for _ in 0..<8 {app.buttons["producer1"].tap()}
        energy("92")
        let positions=cells(named:"Buğday başağı")
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
        let multi=app.buttons["order-quest28"]
        for _ in 0..<3 {
            let delta=multi.frame.minX - 10
            if abs(delta) < 5 {break}
            let movement=min(0.65,abs(delta)/app.frame.width)
            let start=delta > 0 ? 0.85 : 0.15
            let end=delta > 0 ? start-movement : start+movement
            app.coordinate(withNormalizedOffset:CGVector(dx:start,dy:orderY)).press(forDuration:0.1,thenDragTo:app.coordinate(withNormalizedOffset:CGVector(dx:end,dy:orderY)))
        }
        XCTAssertTrue(multi.isHittable)
        XCTAssertGreaterThanOrEqual(multi.frame.minX,0)
        XCTAssertLessThanOrEqual(multi.frame.maxX,app.frame.width)
        let single=app.buttons.matching(NSPredicate(format:"identifier BEGINSWITH 'order-city1-repeat'" )).allElementsBoundByIndex.first(where: {$0.isHittable})!
        XCTAssertGreaterThan(app.buttons["order-quest28"].frame.width,single.frame.width*1.2)
        shot("multi-product-order-controls")
        for i in 0..<54 {XCTAssertEqual(cell(i).frame.width,cell(0).frame.width,accuracy:0.5);XCTAssertEqual(cell(i).frame.height,cell(0).frame.height,accuracy:0.5)}
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
    func testTapMergesNeighboringWheat() {
        app.open(URL(string:"masterland://review")!)
        XCTAssertTrue(app.buttons["order-quest26"].waitForExistence(timeout:10))
        cell(0).tap()
        cell(1).tap()
        XCTAssertEqual(cell(0).label,"Boş hücre")
        XCTAssertEqual(cell(1).label,"Buğday demeti")
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
        app.buttons["producer1"].tap();energy("103");XCTAssertEqual(cells(named:"Tahıl çuvalı").count,1)
        app.buttons["producer1"].tap();energy("95");XCTAssertEqual(cells(named:"Tahıl çuvalı").count,2)
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
        let frame=cell(first).frame;XCTAssertEqual(frame.width,frame.height,accuracy:0.01)
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
        XCTAssertEqual(first.width,last.width,accuracy:0.5);XCTAssertEqual(first.height,last.height,accuracy:0.5);XCTAssertLessThan(last.maxY,app.buttons["tab-board"].frame.minY)
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
        for id in ["profile","stamina","gold","gems","profile-menu","producer1","producer5","producer8","producer6","producer7","tab-board","tab-collection","tab-cities","tab-storage","tab-market","order-quest26"] {values[id]=rect(app.buttons[id])}
        let cellFrames=(0..<54).map {cell($0).frame}
        values["cells"]=cellFrames.map { ["x":$0.minX,"y":$0.minY,"width":$0.width,"height":$0.height] }
        let data=try JSONSerialization.data(withJSONObject:values,options:[.prettyPrinted,.sortedKeys])
        let attachment=XCTAttachment(data:data,uniformTypeIdentifier:"public.json");attachment.name="visual-measurements.json";attachment.lifetime = .keepAlways;add(attachment)
        shot("masterland-v11-measured")
        for frame in cellFrames { XCTAssertEqual(frame.height,cellFrames[0].height,accuracy:0.5); XCTAssertEqual(frame.width,cellFrames[0].width,accuracy:0.5) }
        XCTAssertEqual(cell(0).frame.width,cell(53).frame.width,accuracy:0.5)
        XCTAssertEqual(cell(0).frame.height,cell(53).frame.height,accuracy:0.5)
        XCTAssertGreaterThanOrEqual(cell(0).frame.width,44)
        XCTAssertGreaterThanOrEqual(cell(0).frame.height,44)
    }

    func testSoundSettingDoesNotResetBoard(){
        app.buttons["producer1"].tap();energy("99")
        app.buttons["profile-menu"].tap();XCTAssertTrue(app.descendants(matching:.any).matching(identifier:"setting-sound").firstMatch.waitForExistence(timeout:5));app.descendants(matching:.any).matching(identifier:"setting-sound").firstMatch.tap();app.buttons["closePage"].tap()
        XCTAssertEqual(cells(named:"Buğday başağı").count,1);energy("99")
        app.buttons["profile-menu"].tap();app.descendants(matching:.any).matching(identifier:"setting-sound").firstMatch.tap();app.buttons["closePage"].tap()
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
        app.buttons["exchange-energy25"].tap();energy("125");XCTAssertTrue(app.buttons["gems"].label.contains("9"))
        app.buttons["exchange-gold500"].tap();XCTAssertTrue(app.buttons["gold"].label.contains("8.500"));XCTAssertTrue(app.buttons["gems"].label.contains("4"))
        app.buttons["exchange-energy100"].tap();energy("125");XCTAssertTrue(app.buttons["gems"].label.contains("4"))
        shot("milestone-game-market")
        app.buttons["closePage"].tap();app.buttons["tab-cities"].tap();app.buttons["achievement-achievement1"].tap()
        app.buttons["claimAchievement"].tap();XCTAssertTrue(app.buttons["dismissReward"].waitForExistence(timeout:5));shot("milestone-custom-achievement")
        app.buttons["dismissReward"].tap();XCTAssertFalse(app.buttons["claimAchievement"].exists)
    }

    func testProductionReleasePolicy() {
        XCTAssertFalse(app.buttons["testEnergyFill"].exists)
        XCTAssertFalse(app.buttons["testGoldAdd"].exists)
        XCTAssertFalse(app.buttons["testGemsAdd"].exists)
        XCTAssertFalse(app.buttons["testLevelUp"].exists)
        app.buttons["producer1"].tap()
        let before=app.buttons["stamina"].label
        app.open(URL(string:"masterland://qa-reset")!)
        XCTAssertEqual(app.buttons["stamina"].label,before)
        app.open(URL(string:"masterland://milestone-review")!)
        XCTAssertEqual(app.buttons["stamina"].label,before)
        shot("production-board-no-test-controls")
        app.buttons["tab-market"].tap()
        let scroll=app.scrollViews.firstMatch;scroll.swipeUp();scroll.swipeUp()
        XCTAssertFalse(app.buttons["com.erditaskin.masterland.gems30"].exists)
        XCTAssertFalse(app.buttons["com.erditaskin.masterland.gold2500"].exists)
        XCTAssertTrue(app.staticTexts["Gerçek para paketleri yakında."].exists)
        shot("production-market-real-purchases-disabled")
        app.buttons["tab-board"].tap()
        app.buttons["profile-menu"].tap()
        XCTAssertTrue(app.buttons["signInGoogle"].waitForExistence(timeout:10))
        XCTAssertFalse(app.buttons["signInFacebook"].exists)
        XCTAssertFalse(app.staticTexts["Facebook girişi yakında."].exists)
        shot("production-sign-in-without-facebook")
    }

    func testVerifiedTestFlightReleasePolicy() {
        for id in ["testEnergyFill","testGoldAdd","testGemsAdd","testLevelUp"] {XCTAssertFalse(app.buttons[id].exists)}
        let expected=String(Int(app.buttons["stamina"].label)!-1)
        app.buttons["producer1"].tap()
        let produced=XCTNSPredicateExpectation(predicate:NSPredicate { _,_ in self.app.buttons["stamina"].label == expected },object:nil)
        XCTAssertEqual(XCTWaiter.wait(for:[produced],timeout:10),.completed)
        let before=app.buttons["stamina"].label
        app.open(URL(string:"masterland://qa-reset")!)
        XCTAssertEqual(app.buttons["stamina"].label,before)
        app.open(URL(string:"masterland://milestone-review")!)
        XCTAssertEqual(app.buttons["stamina"].label,before)
        shot("testflight-vps-board-no-test-controls")
        app.buttons["tab-market"].tap()
        app.scrollViews.firstMatch.swipeUp();app.scrollViews.firstMatch.swipeUp()
        XCTAssertFalse(app.buttons["com.erditaskin.masterland.gems30"].exists)
        XCTAssertFalse(app.buttons["com.erditaskin.masterland.gold2500"].exists)
        XCTAssertTrue(app.staticTexts.containing(NSPredicate(format:"label CONTAINS %@","Bu betada gerçek para")).firstMatch.exists)
        shot("testflight-vps-real-purchases-disabled")
        app.buttons["tab-board"].tap();app.buttons["profile-menu"].tap()
        XCTAssertTrue(app.buttons["signInGoogle"].waitForExistence(timeout:10))
        XCTAssertFalse(app.buttons["signInFacebook"].exists)
        shot("testflight-vps-apple-google-sign-in")
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


// Separate read-only reference entry; never runs game-store or account actions.
final class MasterlandReferenceTests:XCTestCase {
    let app=XCUIApplication(bundleIdentifier:"com.erditaskin.masterland")
    override func setUpWithError() throws {
        continueAfterFailure=false
        app.terminate()
        app.launchArguments=["-AppleLanguages","(tr)","-AppleLocale","tr_TR"]
        app.launch()
    }
    func testCaptureDeviceDesignReferences() {
        let ids=[
            "city1-account-deletion",
            "city1-account-guest",
            "city1-account-registered",
            "city1-achievement",
            "city1-achievements",
            "city1-board",
            "city1-cities",
            "city1-cloud-choice",
            "city1-collection",
            "city1-collection-chain",
            "city1-energy",
            "city1-item",
            "city1-market",
            "city1-order-guide",
            "city1-orders",
            "city1-producer-cooldown",
            "city1-storage",
            "city1-storage-board-full",
            "city2-board",
            "city2-cities",
            "city3-board",
            "city3-cities",
            "city4-board",
            "city4-cities",
            "city5-board",
            "city5-cities"]
        XCTAssertEqual(app.frame.width,402,accuracy:0.01)
        XCTAssertEqual(app.frame.height,874,accuracy:0.01)
        for id in ids {
            app.open(URL(string:"masterland://design-reference/"+id)!)
            let marker=app.descendants(matching:.any).matching(identifier:"referenceReady").firstMatch
            let ready=XCTNSPredicateExpectation(predicate:NSPredicate { _,_ in marker.exists && marker.label == id },object:nil)
            XCTAssertEqual(XCTWaiter.wait(for:[ready],timeout:20),.completed,"Unsettled reference: "+id)
            let attachment=XCTAttachment(screenshot:app.screenshot())
            attachment.name="reference-"+id;attachment.lifetime = .keepAlways;add(attachment)
        }
    }
}

final class MasterlandPresentationTests:XCTestCase {
    let app = XCUIApplication(bundleIdentifier:"com.erditaskin.masterland")
    override func setUpWithError() throws {
        continueAfterFailure = false
        app.terminate()
        app.launchArguments = ["-AppleLanguages", "(tr)", "-AppleLocale", "tr_TR"]
        app.launch()
    }
    func capture(_ name:String) {
        let image = XCTAttachment(screenshot:app.screenshot())
        image.name = "presentation-" + name
        image.lifetime = .keepAlways
        add(image)
    }
    func testConnectedActionsKeepTheirGameState() {
        app.open(URL(string:"masterland://presentation-review/storage")!)
        XCTAssertTrue(app.buttons["storage-1"].waitForExistence(timeout:30))
        app.buttons["storage-1"].tap()
        app.buttons["restoreSelected"].tap()
        XCTAssertFalse(app.buttons["restoreSelected"].exists)
        app.buttons["tab-board"].tap()
        let board = app.otherElements["mergeBoard"]
        XCTAssertTrue(board.waitForExistence(timeout:5))
        XCTAssertTrue(app.buttons["producer1"].exists)
        app.buttons["producer1"].tap()
        XCTAssertTrue(app.buttons["stamina"].label.contains("74"))
        capture("city1-all-producers-owned-after-produce")
        app.buttons["tab-market"].tap()
        XCTAssertTrue(app.buttons["exchange-energy25"].waitForExistence(timeout:5))
        app.buttons["exchange-energy25"].tap()
        XCTAssertTrue(app.buttons["stamina"].label.contains("99"))
        XCTAssertTrue(app.buttons["gems"].label.contains("21"))
        app.buttons["closePage"].tap()
        app.buttons["profile-menu"].tap()
        let sound = app.descendants(matching:.any).matching(identifier:"setting-sound").firstMatch
        XCTAssertTrue(sound.waitForExistence(timeout:5))
        let before = sound.value as? String
        sound.tap()
        XCTAssertNotEqual(sound.value as? String,before)
    }
    func testLivePagesAtReferenceFixture() {
        captureViews(["collection", "storage", "storage-board-full", "market", "board", "cities", "account-guest", "account-registered", "collection-chain", "item", "producer-cooldown", "orders", "order-guide", "achievements", "achievement", "cloud-choice", "account-deletion", "energy"])
    }
    func testReadableAccountFailureAndDeletionConsent() {
        app.open(URL(string:"masterland://presentation-review/account-error")!)
        let status = app.staticTexts["accountConnectionStatus"]
        XCTAssertTrue(status.waitForExistence(timeout:30))
        XCTAssertTrue(status.isHittable)
        app.open(URL(string:"masterland://presentation-review/account-deletion")!)
        let warning = app.staticTexts["deletionWarning"]
        XCTAssertTrue(warning.waitForExistence(timeout:10))
        XCTAssertTrue(warning.label.contains("geri alınamaz"))
        let deletion = app.buttons["confirmAccountDeletion"]
        XCTAssertFalse(deletion.isEnabled)
        let consent = app.descendants(matching:.any).matching(identifier:"confirmAccountDeletionConsent").firstMatch
        XCTAssertTrue(consent.exists)
        consent.tap()
        XCTAssertFalse(deletion.isEnabled)
    }
    func testApprovedSixColumnBoard() {
        app.open(URL(string:"masterland://presentation-review/board")!)
        XCTAssertTrue(app.buttons["producer1"].waitForExistence(timeout:30))
        func cellFrame(_ index:Int)->CGRect {
            app.descendants(matching:.any).matching(identifier:"cell-\(index)").firstMatch.frame
        }
        let first = cellFrame(0)
        for index in 0..<54 {
            let f = cellFrame(index)
            XCTAssertEqual(f.width,first.width,accuracy:0.34)
            XCTAssertEqual(f.height,first.height,accuracy:0.34)
        }
        XCTAssertEqual(cellFrame(5).minY,first.minY,accuracy:0.01)
        XCTAssertEqual(cellFrame(6).minX,first.minX,accuracy:0.01)
        XCTAssertEqual(cellFrame(6).minY,first.maxY,accuracy:0.01)
        XCTAssertFalse(app.buttons["cell-54"].exists)
        let board = app.otherElements["mergeBoard"].frame
        XCTAssertLessThan(board.minX,34)
        XCTAssertLessThan(app.frame.maxX-board.maxX,34)
        XCTAssertLessThan(board.maxY,app.buttons["tab-board"].frame.minY)
        XCTAssertLessThan(app.buttons["producer1"].frame.maxY,board.minY)
        let navigationClearance = app.frame.maxY - app.buttons["tab-board"].frame.maxY
        XCTAssertEqual(navigationClearance, 40.0 / 3, accuracy: 1)
        capture("city1-six-column-board")
    }
    func testBoardPixelCandidate() { captureViews(["board"]) }
    func testBoardHasNoTestControls() {
        XCTAssertTrue(app.buttons["producer1"].waitForExistence(timeout:20))
        for identifier in ["testEnergyFill", "testGoldAdd", "testGemsAdd", "testLevelUp"] {
            XCTAssertFalse(app.buttons[identifier].exists)
        }
    }
    func testBelenyakaMultiProductOrdersAndPageBackdrop() {
        app.open(URL(string:"masterland://presentation-review/board-mixed")!)
        let one = app.buttons["order-presentation-rail-0"]
        let two = app.buttons["order-presentation-rail-1"]
        let three = app.buttons["order-presentation-rail-2"]
        XCTAssertTrue(three.waitForExistence(timeout:20))
        XCTAssertTrue(two.label.contains("Elma"))
        XCTAssertTrue(three.label.contains("Süt"))
        XCTAssertTrue(three.label.contains("Ekmek"))
        XCTAssertEqual(two.frame.width / one.frame.width,1.25,accuracy:0.02)
        XCTAssertEqual(three.frame.width / one.frame.width,1.5,accuracy:0.02)
        XCTAssertLessThanOrEqual(three.frame.maxX,app.frame.maxX)
        capture("city1-multi-product-order-rail")
        app.buttons["allOrders"].tap()
        XCTAssertTrue(app.buttons["closePage"].waitForExistence(timeout:10))
        XCTAssertTrue(app.staticTexts["İlan 2"].waitForExistence(timeout:5))
        XCTAssertFalse(app.staticTexts.matching(NSPredicate(format: "label BEGINSWITH %@", "city1-repeat-")).firstMatch.exists)
        capture("city1-all-orders-same-backdrop")
    }

    func testBelenyakaDragWithoutSelection() {
        app.open(URL(string:"masterland://presentation-review/board")!)
        XCTAssertTrue(app.buttons["producer1"].waitForExistence(timeout:20))
        let from = app.buttons["cell-0"]
        let to = app.buttons["cell-23"]
        XCTAssertEqual(from.label,"Buğday başağı")
        XCTAssertEqual(to.label,"Buğday başağı")
        from.press(forDuration:0.1,thenDragTo:to)
        XCTAssertEqual(from.label,"Boş hücre")
        XCTAssertEqual(to.label,"Buğday demeti")
    }

    private func checkBoardStandard(_ view:String, readyOrder:String, readyCells:[Int], partialCell:Int,
                                    from:Int, to:Int, blocked:Int, mergedLabel:String) {
        app.open(URL(string:"masterland://presentation-review/\(view)")!)
        let matching = app.descendants(matching:.any)
        let hint = matching.matching(identifier:"idleMergeMotion").firstMatch
        let order = app.buttons["order-\(readyOrder)"]
        XCTAssertTrue(order.waitForExistence(timeout:20))
        XCTAssertTrue(order.label.contains("Hazır"))
        XCTAssertEqual(order.frame.minX, matching.matching(identifier:"orderRail").firstMatch.frame.minX, accuracy:1)
        for index in readyCells {
            XCTAssertTrue(matching.matching(identifier:"ready-order-cell-\(index)").firstMatch.exists)
        }
        XCTAssertTrue(matching.matching(identifier:"partial-order-cell-\(partialCell)").firstMatch.exists)
        XCTAssertTrue(hint.waitForExistence(timeout:5))
        capture(view + "-idle-and-order-states")
        let source = app.buttons["cell-\(from)"]
        let target = app.buttons["cell-\(to)"]
        let wrong = app.buttons["cell-\(blocked)"]
        let original = source.label
        let unchanged = wrong.label
        source.tap()
        XCTAssertEqual(source.value as? String,"Seçili")
        XCTAssertFalse(hint.exists)
        let empty = app.buttons["cell-2"]
        XCTAssertEqual(empty.label,"Boş hücre")
        source.press(forDuration:0.1,thenDragTo:empty)
        XCTAssertEqual(source.label,"Boş hücre")
        XCTAssertEqual(empty.label,original)
        empty.press(forDuration:0.1,thenDragTo:source)
        XCTAssertEqual(empty.label,"Boş hücre")
        source.press(forDuration:0.1,thenDragTo:wrong)
        XCTAssertEqual(source.label,original)
        XCTAssertEqual(wrong.label,unchanged)
        source.press(forDuration:0.1,thenDragTo:target)
        XCTAssertEqual(source.label,"Boş hücre")
        XCTAssertEqual(target.label,mergedLabel)
    }

    func testBelenyakaBoardStandardParity() {
        checkBoardStandard("board-mixed", readyOrder:"presentation-rail-0", readyCells:[0,5,14,23,34,46],
                           partialCell:18, from:0, to:23, blocked:5, mergedLabel:"Buğday demeti")
    }

    func testBadincaBoardStandardParity() {
        checkBoardStandard("badinca", readyOrder:"quest100", readyCells:[39],
                           partialCell:0, from:6, to:7, blocked:0, mergedLabel:"Pembe pasta")
    }

    func testYalikoruBoardStandardParity() {
        checkBoardStandard("yalikoru", readyOrder:"city3-repeat-0-0", readyCells:[0,5,14,19,20,35,36,48,51],
                           partialCell:7, from:19, to:20, blocked:0, mergedLabel:"Balık ağı")
    }

    func testDemirdereAndIpekyoluStandardPreview() {
        let scenarios = [
            ("demirdere", "city4", "Demirdere", 18, "Cevher arabası", "profession8"),
            ("ipekyolu", "city5", "İpekyolu", 23, "İpek topu", "profession10"),
        ]
        let elements = app.descendants(matching:.any)
        for (view, cityID, city, first, merged, profession) in scenarios {
            app.open(URL(string:"masterland://presentation-review/\(view)")!)
            let start = app.buttons["producer\(first)"]
            let last = app.buttons["producer\(first+4)"]
            XCTAssertTrue(start.waitForExistence(timeout:20))
            for index in first...(first+4) {
                XCTAssertTrue(app.buttons["producer\(index)"].isHittable)
            }
            XCTAssertTrue(elements.matching(identifier:"producer-clock-producer\(first+4)").firstMatch.exists)
            XCTAssertEqual((start.frame.minX + last.frame.maxX) / 2, app.frame.midX, accuracy:1)
            XCTAssertTrue(app.buttons["cell-53"].exists)
            XCTAssertFalse(app.buttons["cell-54"].exists)
            let board = elements.matching(identifier:"mergeBoard").firstMatch
            let middleTab = app.buttons["tab-cities"]
            XCTAssertEqual(middleTab.frame.midX, app.frame.midX, accuracy:1)
            XCTAssertLessThan(board.frame.maxY, middleTab.frame.minY)
            let orders = (0..<3).map { app.buttons["order-\(cityID)-repeat-0-\($0)"] }
            XCTAssertTrue(orders[0].label.contains("Hazır"))
            XCTAssertTrue(orders[1].label.contains("Hazır"))
            XCTAssertEqual(orders[1].frame.width / orders[0].frame.width, 1.25, accuracy:0.02)
            XCTAssertEqual(orders[2].frame.width / orders[0].frame.width, 1.5, accuracy:0.02)
            XCTAssertTrue(elements.matching(identifier:"ready-order-cell-0").firstMatch.exists)
            XCTAssertTrue(elements.matching(identifier:"ready-order-cell-1").firstMatch.exists)
            XCTAssertTrue(elements.matching(identifier:"partial-order-cell-7").firstMatch.exists)
            XCTAssertTrue(elements.matching(identifier:"idleMergeMotion").firstMatch.waitForExistence(timeout:5))
            capture(view + "-shared-board")
            let from = app.buttons["cell-0"]
            let to = app.buttons["cell-1"]
            let wrong = app.buttons["cell-5"]
            let original = from.label
            from.press(forDuration:0.1,thenDragTo:wrong)
            XCTAssertEqual(from.label,original)
            from.press(forDuration:0.1,thenDragTo:to)
            XCTAssertEqual(from.label,"Boş hücre")
            XCTAssertEqual(to.label,merged)
            start.tap()
            XCTAssertEqual(app.buttons["stamina"].label,"98")
            app.buttons["allOrders"].tap()
            XCTAssertTrue(app.buttons["closePage"].waitForExistence(timeout:5))
            capture(view + "-all-orders")
            app.buttons["tab-board"].tap()
            let hud = app.buttons["cityAchievementsHUD"]
            XCTAssertTrue(hud.label.contains(city))
            hud.tap()
            XCTAssertTrue(app.buttons["achievement-\(cityID)-\(profession)-rank0"].waitForExistence(timeout:5))
        }
    }

    func testPreviewTravelBetweenDemirdereAndIpekyolu() {
        app.open(URL(string:"masterland://presentation-review/demirdere")!)
        XCTAssertTrue(app.buttons["producer18"].waitForExistence(timeout:20))
        let from = app.buttons["cell-0"]
        from.press(forDuration:0.1,thenDragTo:app.buttons["cell-1"])
        XCTAssertEqual(from.label,"Boş hücre")
        func travel(_ id:String) {
            app.buttons["tab-cities"].tap()
            let button = app.buttons["travel-\(id)"]
            let rail = app.descendants(matching:.any).matching(identifier:"cityRouteScroll").firstMatch
            XCTAssertTrue(rail.waitForExistence(timeout:5))
            if !button.isHittable { rail.swipeUp() }
            XCTAssertTrue(button.isHittable)
            button.tap()
        }
        travel("city5")
        XCTAssertTrue(app.buttons["producer23"].waitForExistence(timeout:5))
        travel("city4")
        XCTAssertTrue(app.buttons["producer18"].waitForExistence(timeout:5))
        XCTAssertEqual(from.label,"Boş hücre")
    }

    func testSharedMarketAndAccountLayout() {
        for view in ["board", "badinca", "yalikoru", "demirdere", "ipekyolu"] {
            app.open(URL(string:"masterland://presentation-review/\(view)")!)
            let profile = app.buttons["profile-menu"]
            XCTAssertTrue(profile.waitForExistence(timeout:15))
            app.buttons["tab-market"].tap()
            XCTAssertTrue(app.buttons.matching(NSPredicate(format:"identifier BEGINSWITH %@", "exchange-")).firstMatch.waitForExistence(timeout:5))
            capture(view + "-shared-market")
            app.buttons["tab-board"].tap()
            profile.tap()
            let apple = app.buttons["signInApple"]
            let google = app.buttons["signInGoogle"]
            let facebook = app.buttons["signInFacebook"]
            XCTAssertTrue(apple.waitForExistence(timeout:5))
            XCTAssertTrue(google.isHittable)
            XCTAssertTrue(facebook.isHittable)
            XCTAssertLessThan(apple.frame.minY, google.frame.minY)
            XCTAssertLessThan(google.frame.minY, facebook.frame.minY)
            XCTAssertGreaterThan(app.descendants(matching:.any).matching(identifier:"setting-sound").firstMatch.frame.minY, facebook.frame.maxY)
            XCTAssertFalse(app.staticTexts["İlerlemeni buluta kaydet"].exists)
            capture(view + "-shared-account")
            app.buttons["closePage"].tap()
        }
        app.open(URL(string:"masterland://presentation-review/account-registered")!)
        let signOut = app.buttons["accountSignOut"]
        XCTAssertTrue(signOut.waitForExistence(timeout:15))
        XCTAssertTrue(app.staticTexts["Ad soyad · Deniz Kaya"].exists)
        XCTAssertTrue(app.staticTexts["E-posta · deniz@example.com"].exists)
        XCTAssertTrue(app.staticTexts["Oturum yöntemi · Apple"].exists)
        XCTAssertLessThan(signOut.frame.maxY, app.descendants(matching:.any).matching(identifier:"setting-sound").firstMatch.frame.minY)
        XCTAssertFalse(app.buttons["signInApple"].exists)
        capture("shared-account-registered")
    }

    func testCityAchievementLocalization() {
        let cities = [
            ("board-mixed", "city1", "Belenyaka", "Meadowbrook", "profession1", "Çiftçi", "Farmer"),
            ("badinca", "city2", "Badınca", "Baker’s Market", "profession5", "Pastacı", "Pastry Chef"),
            ("yalikoru", "city3", "Yalıkoru", "Timberbay", "profession3", "Balıkçı", "Fisherman"),
            ("demirdere", "city4", "Demirdere", "Ironvale", "profession8", "Madenci", "Miner"),
            ("ipekyolu", "city5", "İpekyolu", "Silkford", "profession10", "Terzi", "Tailor"),
        ]
        func check(_ english:Bool) {
            for (view, id, tr, en, professionID, professionTR, professionEN) in cities {
                app.open(URL(string:"masterland://presentation-review/\(view)")!)
                let hud = app.buttons["cityAchievementsHUD"]
                XCTAssertTrue(hud.waitForExistence(timeout:15))
                let title = english ? "\(en) Achievements" : "\(tr) Başarıları"
                XCTAssertTrue(hud.label.contains(title), hud.label)
                XCTAssertEqual(app.buttons["tab-board"].label, english ? "Board" : "Tahta")
                capture(view + (english ? "-board-en" : "-board-tr"))
                hud.tap()
                let novice = app.buttons["achievement-\(id)-\(professionID)-rank0"]
                let apprentice = app.buttons["achievement-\(id)-\(professionID)-rank1"]
                let journeyman = app.buttons["achievement-\(id)-\(professionID)-rank2"]
                XCTAssertTrue(novice.waitForExistence(timeout:5))
                XCTAssertTrue(novice.label.contains(english ? "Novice \(professionEN)" : "Hevesli \(professionTR)"), novice.label)
                XCTAssertTrue(apprentice.label.contains(english ? "Apprentice" : "Çırak"), apprentice.label)
                XCTAssertTrue(journeyman.label.contains(english ? "Journeyman" : "Kalfa"), journeyman.label)
                novice.tap()
                let claim = app.buttons["claimAchievement"]
                XCTAssertTrue(claim.waitForExistence(timeout:5))
                XCTAssertEqual(claim.label, english ? "In progress" : "Devam ediyor")
                capture(view + (english ? "-achievements-en" : "-achievements-tr"))
                app.buttons["tab-board"].tap()
            }
        }
        func switchLanguage(_ code:String) {
            app.buttons["profile-menu"].tap()
            let language = app.buttons["language-" + code]
            if !language.isHittable { app.scrollViews.firstMatch.swipeUp() }
            XCTAssertTrue(language.isHittable)
            language.tap()
            app.buttons["closePage"].tap()
        }
        app.open(URL(string:"masterland://presentation-review/yalikoru")!)
        XCTAssertTrue(app.buttons["profile-menu"].waitForExistence(timeout:15))
        switchLanguage("tr")
        check(false)
        switchLanguage("en")
        check(true)
        switchLanguage("tr")
    }

    func testStandardCityLayoutAndAchievementEntry() {
        let cities = [
            ("board-mixed", "city1", "Belenyaka", "producer1", "producer7", "profession1"),
            ("badinca", "city2", "Badınca", "producer10", "producer14", "profession5"),
            ("yalikoru", "city3", "Yalıkoru", "producer3", "producer17", "profession3"),
        ]
        for (view, cityID, cityName, firstID, lastID, professionID) in cities {
            app.open(URL(string:"masterland://presentation-review/\(view)")!)
            let hud = app.buttons["cityAchievementsHUD"]
            let first = app.buttons[firstID]
            XCTAssertTrue(first.waitForExistence(timeout:20))
            XCTAssertTrue(hud.label.contains(cityName))
            XCTAssertGreaterThanOrEqual(hud.frame.minX,app.buttons["gems"].frame.maxX)
            let last = app.buttons[lastID]
            XCTAssertTrue(last.exists, lastID)
            XCTAssertEqual((first.frame.minX + last.frame.maxX) / 2, app.frame.midX, accuracy:1)
            let tabs = ["board","collection","cities","storage","market"].map { app.buttons["tab-" + $0].frame }
            for frame in tabs {
                XCTAssertEqual(frame.width,tabs[0].width,accuracy:0.5)
            }
            XCTAssertEqual(tabs[2].midX,app.frame.midX,accuracy:1)
            capture(view + "-shared-navigation")
            hud.tap()
            let novice = app.buttons["achievement-\(cityID)-\(professionID)-rank0"]
            XCTAssertTrue(novice.waitForExistence(timeout:5))
            XCTAssertTrue(app.buttons["achievement-\(cityID)-\(professionID)-rank1"].exists)
            XCTAssertTrue(app.buttons["achievement-\(cityID)-\(professionID)-rank2"].exists)
            capture(view + "-achievements")
            novice.tap()
            let claim = app.buttons["claimAchievement"]
            XCTAssertTrue(claim.waitForExistence(timeout:5))
            XCTAssertFalse(claim.isEnabled)
            app.buttons["closePage"].tap()
            XCTAssertTrue(novice.waitForExistence(timeout:5))
        }
    }

    func testYalikoruCombinedAchievementRequiresAllThreeProfessions() {
        app.open(URL(string:"masterland://presentation-review/yalikoru")!)
        let carpentry = app.buttons["order-city3-repeat-0-1"]
        XCTAssertTrue(carpentry.waitForExistence(timeout:20))
        carpentry.tap()
        let hud = app.buttons["cityAchievementsHUD"]
        let combo = app.buttons["achievement-city3-combo3-rank0"]
        let claim = app.buttons["claimAchievement"]
        hud.tap()
        XCTAssertTrue(combo.waitForExistence(timeout:5))
        XCTAssertTrue(combo.label.contains("Hevesli Denizci"))
        combo.tap()
        XCTAssertTrue(claim.waitForExistence(timeout:5))
        XCTAssertFalse(claim.isEnabled)
        app.buttons["tab-board"].tap()
        let shipbuilding = app.buttons["order-city3-repeat-1-1"]
        XCTAssertTrue(shipbuilding.waitForExistence(timeout:5))
        shipbuilding.tap()
        XCTAssertTrue(hud.label.contains("4 kazanım"))
        hud.tap()
        combo.tap()
        XCTAssertTrue(claim.waitForExistence(timeout:5))
        XCTAssertTrue(claim.isEnabled)
        capture("yalikoru-combined-achievement-ready")
        claim.tap()
        let dismiss = app.buttons["dismissReward"]
        if dismiss.waitForExistence(timeout:2) { dismiss.tap() }
        XCTAssertFalse(claim.isEnabled)
    }

    func testYalikoruClaimLocalRankAndCityCardSpacing() {
        app.open(URL(string:"masterland://presentation-review/yalikoru")!)
        let delivery = app.buttons["order-city3-repeat-0-0"]
        XCTAssertTrue(delivery.waitForExistence(timeout:20))
        delivery.tap()
        let hud = app.buttons["cityAchievementsHUD"]
        XCTAssertTrue(hud.label.contains("1 kazanım"))
        hud.tap()
        app.buttons["achievement-city3-profession3-rank0"].tap()
        let claim = app.buttons["claimAchievement"]
        XCTAssertTrue(claim.waitForExistence(timeout:5))
        XCTAssertTrue(claim.isEnabled)
        claim.tap()
        let dismiss = app.buttons["dismissReward"]
        if dismiss.waitForExistence(timeout:2) { dismiss.tap() }
        XCTAssertFalse(claim.isEnabled)
        app.buttons["tab-cities"].tap()
        let first = app.buttons["jump-city1"]
        XCTAssertTrue(first.waitForExistence(timeout:5))
        let second = app.buttons["jump-city2"]
        XCTAssertGreaterThan(second.frame.minY - first.frame.minY, 110)
        capture("city-card-spacing")
    }

    func testYalikoruStandardPreview() {
        app.open(URL(string:"masterland://presentation-review/yalikoru")!)
        XCTAssertTrue(app.buttons["producer17"].waitForExistence(timeout:20))
        for id in ["producer3", "producer4", "producer15", "producer16", "producer17"] {
            XCTAssertTrue(app.buttons[id].isHittable, id)
        }
        XCTAssertTrue(app.descendants(matching:.any).matching(identifier:"producer-clock-producer17").firstMatch.exists)
        let leftProducer = app.buttons["producer3"].frame
        let rightProducer = app.buttons["producer17"].frame
        XCTAssertEqual((leftProducer.minX + rightProducer.maxX) / 2, app.frame.midX, accuracy:1)
        XCTAssertTrue(app.buttons["cell-53"].exists)
        XCTAssertFalse(app.buttons["cell-54"].exists)
        capture("yalikoru-board")
        let rope = app.buttons["cell-19"]
        let target = app.buttons["cell-20"]
        XCTAssertTrue(rope.label.contains("Balıkçı ipi"))
        rope.press(forDuration:0.1,thenDragTo:target)
        XCTAssertEqual(rope.label,"Boş hücre")
        XCTAssertEqual(target.label,"Balık ağı")
        app.buttons["tab-cities"].tap()
        XCTAssertTrue(app.buttons["jump-city3"].waitForExistence(timeout:5))
        capture("yalikoru-cities")
    }

    func testBadincaDragMergesKnownNeighboringPieces() {
        app.open(URL(string:"masterland://presentation-review/badinca")!)
        XCTAssertTrue(app.buttons["producer14"].waitForExistence(timeout:20))
        let source = app.buttons["cell-6"]
        let target = app.buttons["cell-7"]
        XCTAssertTrue(source.label.contains("Kremalı pasta"))
        XCTAssertTrue(target.label.contains("Kremalı pasta"))
        source.coordinate(withNormalizedOffset:CGVector(dx:0.3,dy:0.5))
          .press(forDuration:0.12,thenDragTo:target.coordinate(withNormalizedOffset:CGVector(dx:0.7,dy:0.5)),withVelocity:.slow,thenHoldForDuration:0.85)
        XCTAssertEqual(source.label,"Boş hücre")
        XCTAssertEqual(target.label,"Pembe pasta")
        let different = app.buttons["cell-0"]
        let before = different.label
        different.press(forDuration:0.1,thenDragTo:target)
        XCTAssertEqual(different.label,before)
        XCTAssertEqual(target.label,"Pembe pasta")
    }

    func testBadincaStandardAndAllProducerProducts() {
        app.open(URL(string:"masterland://presentation-review/badinca")!)
        XCTAssertTrue(app.buttons["producer10"].waitForExistence(timeout:20))
        let chains = [("producer10", 126...132), ("producer11", 133...140), ("producer12", 141...149), ("producer13", 150...159), ("producer14", 160...166)]
        for (id, _) in chains { XCTAssertTrue(app.buttons[id].isHittable, id) }
        XCTAssertTrue(app.buttons["cell-53"].exists)
        XCTAssertFalse(app.buttons["cell-54"].exists)
        capture("badinca-board")
        let firstOrder = app.buttons["order-quest100"]
        let originalX = firstOrder.frame.minX
        let railY = firstOrder.frame.midY / app.frame.height
        app.coordinate(withNormalizedOffset:CGVector(dx:0.84,dy:railY)).press(forDuration:0.1,thenDragTo:app.coordinate(withNormalizedOffset:CGVector(dx:0.16,dy:railY)))
        XCTAssertLessThan(firstOrder.frame.minX, originalX - 20)
        app.buttons["producer10"].tap()
        XCTAssertEqual(app.buttons["stamina"].label,"98")
        for (id, itemIDs) in chains {
            app.buttons[id].press(forDuration:0.7)
            let details = app.buttons["powerProductDetails"]
            XCTAssertTrue(details.waitForExistence(timeout:5), id)
            details.tap()
            XCTAssertTrue(app.buttons["closePage"].waitForExistence(timeout:5))
            for number in itemIDs {
                let item = app.buttons["product-slot-item" + String(number)]
                XCTAssertTrue(item.exists, "Missing product slot " + String(number))
                XCTAssertTrue(item.label.contains("Açık"), "Missing discovered product " + String(number))
            }
            capture("badinca-" + id)
            app.buttons["tab-board"].tap()
            XCTAssertTrue(app.buttons[id].waitForExistence(timeout:5))
        }
        app.buttons["tab-cities"].tap()
        XCTAssertTrue(app.buttons["jump-city2"].waitForExistence(timeout:5))
        capture("badinca-cities")
        app.buttons["tab-board"].tap()
        XCTAssertTrue(app.buttons["producer10"].waitForExistence(timeout:5))
    }

    func testBelenyakaOrderWidths() {
        for count in [3, 2] {
            let view = count == 3 ? "board" : "board-two"
            app.open(URL(string:"masterland://presentation-review/" + view)!)
            let cards = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH %@", "order-presentation-rail-"))
            let ready = XCTNSPredicateExpectation(predicate: NSPredicate { _,_ in cards.count == count }, object: nil)
            XCTAssertEqual(XCTWaiter.wait(for:[ready],timeout:20),.completed)
            let first = cards.element(boundBy:0).frame
            let last = cards.element(boundBy:count - 1).frame
            XCTAssertEqual(first.width,last.width,accuracy:1)
            XCTAssertEqual(last.maxX - first.minX,(Double(count) * 1092.0 / 3.75 + Double(count - 1) * 8) / 3,accuracy:2)
            XCTAssertTrue(app.buttons["tab-board"].isHittable)
            capture("city1-" + String(count) + "-orders")
        }
    }

    func testPixelRevisionCandidates() {
        captureViews(["storage", "market", "collection", "producer-cooldown", "achievement", "collection-chain"])
    }
    func captureViews(_ views:[String]) {
        for view in views {
            app.open(URL(string:"masterland://presentation-review/" + view)!)
            XCTAssertTrue(app.buttons["stamina"].waitForExistence(timeout:30))
            let settled = XCTNSPredicateExpectation(predicate:NSPredicate { _,_ in
                self.app.buttons["gold"].label == (view == "board" ? "5" : "2.480")
            },object:nil)
            XCTAssertEqual(XCTWaiter.wait(for:[settled],timeout:10),.completed)
            if view.hasPrefix("storage") {
                XCTAssertTrue(app.buttons["storage-1"].waitForExistence(timeout:10))
                app.buttons["storage-1"].tap()
                XCTAssertTrue(app.buttons["restoreSelected"].waitForExistence(timeout:5))
                XCTAssertEqual(app.buttons["restoreSelected"].isEnabled,view != "storage-board-full")
            }
            // Wait for painted layers and the page entrance to settle, not for an arbitrary pixel match.
            let stable = XCTNSPredicateExpectation(predicate:NSPredicate { _,_ in self.app.buttons["tab-board"].isHittable },object:nil)
            XCTAssertEqual(XCTWaiter.wait(for:[stable],timeout:5),.completed)
            capture("city1-" + view)
            if view == "market" { capture("city1-market-repeat") }
        }
    }
}
