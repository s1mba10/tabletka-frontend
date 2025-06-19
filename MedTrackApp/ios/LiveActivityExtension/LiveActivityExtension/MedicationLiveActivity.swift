import ActivityKit
import WidgetKit
import SwiftUI

@available(iOS 16.1, *)
struct MedicationLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: MedicationActivityAttributes.self) { context in
            // Lock screen/banner UI
            VStack(alignment: .leading) {
                Text(context.attributes.medicationName)
                    .font(.headline)
                ProgressView(value: context.state.progress)
                    .progressViewStyle(.linear)
                    .padding(.top, 4)
                Text(context.state.endDate, style: .timer)
                    .font(.caption)
                    .padding(.top, 2)
            }
            .padding()
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text(context.attributes.medicationName)
                        .font(.subheadline)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.state.endDate, style: .timer)
                        .font(.subheadline)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    ProgressView(value: context.state.progress)
                }
            } compactLeading: {
                Image(systemName: "pills")
            } compactTrailing: {
                Text(context.state.endDate, style: .timer)
            } minimal: {
                Image(systemName: "pills")
            }
        }
    }
}

@available(iOS 16.1, *)
struct MedicationLiveActivity_Previews: PreviewProvider {
    static var previews: some View {
        if #available(iOS 17.0, *) {
            MedicationLiveActivity()
                .previewContext(WidgetPreviewContext(family: .systemMedium))
        }
    }
}
