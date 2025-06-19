import Foundation
import ActivityKit
import React

@objc(LiveActivityManager)
class LiveActivityManager: NSObject, RCTBridgeModule {
    static func moduleName() -> String! {
        return "LiveActivityManager"
    }

    static func requiresMainQueueSetup() -> Bool {
        return false
    }
    private var activity: Activity<MedicationActivityAttributes>?

    @objc(start:duration:resolver:rejecter:)
    func start(name: String, duration: NSNumber, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        if #available(iOS 16.1, *) {
            let attributes = MedicationActivityAttributes(medicationName: name, startDate: Date())
            let contentState = MedicationActivityAttributes.ContentState(progress: 0.0, endDate: Date().addingTimeInterval(duration.doubleValue))
            do {
                activity = try Activity.request(attributes: attributes, contentState: contentState, pushType: nil)
                resolver(nil)
            } catch {
                rejecter("ERR_START", error.localizedDescription, error)
            }
        } else {
            rejecter("UNSUPPORTED", "Live Activities require iOS 16.1", nil)
        }
    }

    @objc(update:resolver:rejecter:)
    func update(progress: NSNumber, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        if #available(iOS 16.1, *) {
            guard let activity = activity else { resolver(nil); return }
            Task {
                var state = activity.contentState
                state.progress = progress.doubleValue
                await activity.update(using: state)
                resolver(nil)
            }
        } else {
            rejecter("UNSUPPORTED", "Live Activities require iOS 16.1", nil)
        }
    }

    @objc(stop:resolver:rejecter:)
    func stop(immediate: NSNumber, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        if #available(iOS 16.1, *) {
            guard let activity = activity else { resolver(nil); return }
            Task {
                await activity.end(dismissalPolicy: immediate.boolValue ? .immediate : .after(Date()))
                self.activity = nil
                resolver(nil)
            }
        } else {
            rejecter("UNSUPPORTED", "Live Activities require iOS 16.1", nil)
        }
    }

}
