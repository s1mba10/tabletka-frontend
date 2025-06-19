import Foundation
import ActivityKit

@available(iOS 16.1, *)
struct MedicationActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var progress: Double
        var endDate: Date
    }

    var medicationName: String
    var startDate: Date
}
