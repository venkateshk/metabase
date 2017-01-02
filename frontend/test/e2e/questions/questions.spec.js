
import {
    describeE2E,
    ensureLoggedIn
} from "../support/utils";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describeE2E("questions", () => {
    beforeEach(async () => {
        await ensureLoggedIn(server, driver, "bob@metabase.com", "12341234");
    });

    describe("archive_action", () => {
        it("should remove the question from the list", async () => {
            // First we need to save a question
            // load the query builder
            await d.get("/q");

            // pick the orders table (assumes database is already selected, i.e. there's only 1 database)
            await d.select("#TablePicker .List-item a:contains(Orders)").wait().click();

            await d.select(":react(AggregationWidget)").wait().click();

            await d.select("#AggregationPopover .List-item:nth-child(2)>a").wait().click();

            await d.select(".Query-section.Query-section-breakout #BreakoutWidget").wait().click();
            await d.select("#BreakoutPopover .List-section:nth-child(3) .List-section-header").wait().click();
            await d.select("#BreakoutPopover .List-item:nth-child(12)>a").wait().click();

            await d.select(".Query-section.Query-section-breakout #BreakoutWidget .AddButton").wait().click();
            await d.select("#BreakoutPopover .List-item:first-child .Field-extra>a").wait().click();
            await d.select("#TimeGroupingPopover .List-item:nth-child(4)>a").wait().click();

            await d.select(".Button.RunButton").wait().click();

            await d.select(".Loading").waitRemoved(20000);

            // save question
            await d.select(".Header-buttonSection:first-child").wait().click();
            await d.select("#SaveQuestionModal input[name='name']").wait().sendKeys("Pivot Table");
            await d.select("#SaveQuestionModal .Button.Button--primary").wait().click();

            // switch to the Questions section
            await d.get(`${server.host}/questions`);
            await waitForElementAndClick(driver, "");

            // click Archive action on first question in the Everything Else list

            // make sure the question is no longer in the list
        });
    });
});
