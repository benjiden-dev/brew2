import Foundation
import Capacitor
import ActivityKit

@available(iOS 16.1, *)
@objc(LiveActivityModule)
public class LiveActivityModule: CAPPlugin {

    var activity: Activity<BrewAttributes>?

    @objc func startActivity(_ call: CAPPluginCall) {
        guard let recipeName = call.getString("recipeName"),
              let stepName = call.getString("stepName"),
              let endTimestamp = call.getDouble("endTimestamp"),
              let stepIndex = call.getInt("stepIndex"),
              let totalSteps = call.getInt("totalSteps") else {
            call.reject("Missing arguments")
            return
        }

        let attributes = BrewAttributes(recipeName: recipeName)
        let state = BrewAttributes.ContentState(
            stepName: stepName,
            stepIndex: stepIndex,
            totalSteps: totalSteps,
            endTime: Date(timeIntervalSince1970: endTimestamp)
        )

        do {
            activity = try Activity<BrewAttributes>.request(
                attributes: attributes,
                content: .init(state: state, staleDate: nil)
            )
            call.resolve(["activityId": activity?.id ?? ""])
        } catch {
            call.reject("Failed to start activity: \(error.localizedDescription)")
        }
    }

    @objc func updateActivity(_ call: CAPPluginCall) {
        guard let stepName = call.getString("stepName"),
              let endTimestamp = call.getDouble("endTimestamp"),
              let stepIndex = call.getInt("stepIndex") else {
             call.reject("Missing arguments")
             return
        }

        guard let activity = activity else {
            call.reject("No active activity")
            return
        }

        let newState = BrewAttributes.ContentState(
            stepName: stepName,
            stepIndex: stepIndex,
            totalSteps: activity.content.state.totalSteps,
            endTime: Date(timeIntervalSince1970: endTimestamp)
        )

        Task {
            await activity.update(.init(state: newState, staleDate: nil))
            call.resolve()
        }
    }

    @objc func endActivity(_ call: CAPPluginCall) {
        guard let activity = activity else {
            call.resolve()
            return
        }

        Task {
            await activity.end(nil, dismissalPolicy: .immediate)
            self.activity = nil
            call.resolve()
        }
    }
}
