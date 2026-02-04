import ActivityKit
import WidgetKit
import SwiftUI

// Make sure BrewAttributes is available to this target!
// You must add ios/App/App/BrewAttributes.swift to the Widget Extension Target.

struct BrewWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: BrewAttributes.self) { context in
            // Lock Screen UI
            BrewActivityView(context: context)
                .activityBackgroundTint(Color.black.opacity(0.8))
                .activitySystemActionForegroundColor(Color.white)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded
                DynamicIslandExpandedRegion(.leading) {
                    Label(context.attributes.recipeName, systemImage: "cup.and.saucer.fill")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                        .padding(.leading, 8)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Step \(context.state.stepIndex)/\(context.state.totalSteps)")
                        .font(.caption2)
                        .padding(.trailing, 8)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    VStack {
                        Text(context.state.stepName)
                            .font(.headline)
                        Text(timerInterval: Date()...context.state.endTime, countsDown: true)
                            .font(.largeTitle)
                            .monospacedDigit()
                    }
                }
            } compactLeading: {
                Image(systemName: "cup.and.saucer.fill")
                    .foregroundColor(.brown)
                    .padding(.leading, 4)
            } compactTrailing: {
                Text(timerInterval: Date()...context.state.endTime, countsDown: true)
                    .frame(width: 40)
                    .monospacedDigit()
                    .font(.caption2)
                    .padding(.trailing, 4)
            } minimal: {
                Image(systemName: "cup.and.saucer.fill")
                    .foregroundColor(.brown)
            }
        }
    }
}

struct BrewActivityView: View {
    let context: ActivityViewContext<BrewAttributes>

    var body: some View {
        VStack(alignment: .leading) {
            HStack {
                Image(systemName: "cup.and.saucer.fill")
                    .foregroundColor(.brown)
                Text(context.attributes.recipeName)
                    .font(.caption)
                    .bold()
                Spacer()
                Text("Step \(context.state.stepIndex)/\(context.state.totalSteps)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            HStack(alignment: .bottom) {
                Text(context.state.stepName)
                    .font(.title2)
                    .bold()

                Spacer()

                Text(timerInterval: Date()...context.state.endTime, countsDown: true)
                    .font(.system(size: 32, weight: .semibold, design: .monospaced))
                    .foregroundColor(.yellow)
            }
        }
        .padding()
    }
}
