import Foundation
import ActivityKit

public struct BrewAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        public var stepName: String
        public var stepIndex: Int
        public var totalSteps: Int
        public var endTime: Date
    }

    public var recipeName: String

    public init(recipeName: String) {
        self.recipeName = recipeName
    }
}
