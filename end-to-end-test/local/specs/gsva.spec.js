var assert = require('assert');
var goToUrlAndSetLocalStorage = require('../../shared/specUtils')
    .goToUrlAndSetLocalStorage;
var goToUrlAndSetLocalStorageWithProperty = require('../../shared/specUtils')
    .goToUrlAndSetLocalStorageWithProperty;
var waitForStudyQueryPage = require('../../shared/specUtils')
    .waitForStudyQueryPage;
var waitForGeneQueryPage = require('../../shared/specUtils')
    .waitForGeneQueryPage;
var waitForOncoprint = require('../../shared/specUtils').waitForOncoprint;
var waitForPlotsTab = require('../../shared/specUtils').waitForPlotsTab;
var waitForCoExpressionTab = require('../../shared/specUtils')
    .waitForCoExpressionTab;
var reactSelectOption = require('../../shared/specUtils').reactSelectOption;
var getReactSelectOptions = require('../../shared/specUtils')
    .getReactSelectOptions;
var selectReactSelectOption = require('../../shared/specUtils')
    .selectReactSelectOption;

var {
    clickQueryByGeneButton,
    showGsva,
    jq,
} = require('../../shared/specUtils');

const CBIOPORTAL_URL = process.env.CBIOPORTAL_URL.replace(/\/$/, '');
const oncoprintTabUrl =
    CBIOPORTAL_URL +
    '/results/oncoprint?Action=Submit&RPPA_SCORE_THRESHOLD=2.0&Z_SCORE_THRESHOLD=2.0&cancer_study_list=study_es_0&case_set_id=study_es_0_cnaseq&data_priority=0&gene_list=CDKN2A%2520MDM2%2520MDM4%2520TP53&geneset_list=GO_ACYLGLYCEROL_HOMEOSTASIS%20GO_ANATOMICAL_STRUCTURE_FORMATION_INVOLVED_IN_MORPHOGENESIS%20GO_ANTEROGRADE_AXONAL_TRANSPORT%20GO_APICAL_PROTEIN_LOCALIZATION%20GO_ATP_DEPENDENT_CHROMATIN_REMODELING%20GO_CARBOHYDRATE_CATABOLIC_PROCESS%20GO_CARDIAC_CHAMBER_DEVELOPMENT&genetic_profile_ids_PROFILE_COPY_NUMBER_ALTERATION=study_es_0_gistic&genetic_profile_ids_PROFILE_GENESET_SCORE=study_es_0_gsva_scores&genetic_profile_ids_PROFILE_MUTATION_EXTENDED=study_es_0_mutations&tab_index=tab_visualize&show_samples=false&clinicallist=PROFILED_IN_study_es_0_gsva_scores%2CPROFILED_IN_study_es_0_mutations%2CPROFILED_IN_study_es_0_gistic';
const plotsTabUrl =
    CBIOPORTAL_URL +
    '/results/plots?Action=Submit&RPPA_SCORE_THRESHOLD=2.0&Z_SCORE_THRESHOLD=2.0&cancer_study_list=study_es_0&case_set_id=study_es_0_cnaseq&clinicallist=PROFILED_IN_study_es_0_gsva_scores%2CPROFILED_IN_study_es_0_mutations%2CPROFILED_IN_study_es_0_gistic&data_priority=0&gene_list=CDKN2A%2520MDM2%2520MDM4%2520TP53&geneset_list=GO_ACYLGLYCEROL_HOMEOSTASIS%20GO_ANATOMICAL_STRUCTURE_FORMATION_INVOLVED_IN_MORPHOGENESIS%20GO_ANTEROGRADE_AXONAL_TRANSPORT%20GO_APICAL_PROTEIN_LOCALIZATION%20GO_ATP_DEPENDENT_CHROMATIN_REMODELING%20GO_CARBOHYDRATE_CATABOLIC_PROCESS%20GO_CARDIAC_CHAMBER_DEVELOPMENT&genetic_profile_ids_PROFILE_COPY_NUMBER_ALTERATION=study_es_0_gistic&genetic_profile_ids_PROFILE_GENESET_SCORE=study_es_0_gsva_scores&genetic_profile_ids_PROFILE_MUTATION_EXTENDED=study_es_0_mutations&show_samples=false&tab_index=tab_visualize';
const coexpressionTabUrl =
    CBIOPORTAL_URL +
    '/results/coexpression?Action=Submit&RPPA_SCORE_THRESHOLD=2.0&Z_SCORE_THRESHOLD=2.0&cancer_study_list=study_es_0&case_set_id=study_es_0_all&clinicallist=NUM_SAMPLES_PER_PATIENT%2CPROFILED_IN_study_es_0_gsva_scores%2CPROFILED_IN_study_es_0_mutations%2CPROFILED_IN_study_es_0_gistic%2CPROFILED_IN_study_es_0_mrna_median_Zscores&data_priority=0&gene_list=CREB3L1%2520RPS11%2520PNMA1%2520MMP2%2520ZHX3%2520ERCC5&geneset_list=GO_ATP_DEPENDENT_CHROMATIN_REMODELING%20GO_ACYLGLYCEROL_HOMEOSTASIS%20GO_ANATOMICAL_STRUCTURE_FORMATION_INVOLVED_IN_MORPHOGENESIS%20GO_ANTEROGRADE_AXONAL_TRANSPORT%20GO_APICAL_PROTEIN_LOCALIZATION%20GO_CARBOHYDRATE_CATABOLIC_PROCESS%20GO_CARDIAC_CHAMBER_DEVELOPMENT&genetic_profile_ids_PROFILE_COPY_NUMBER_ALTERATION=study_es_0_gistic&genetic_profile_ids_PROFILE_GENESET_SCORE=study_es_0_gsva_scores&genetic_profile_ids_PROFILE_MRNA_EXPRESSION=study_es_0_mrna_median_Zscores&genetic_profile_ids_PROFILE_MUTATION_EXTENDED=study_es_0_mutations&show_samples=false&tab_index=tab_visualize%27';
const ADD_TRACKS_HEATMAP_TAB = '.oncoprintAddTracks a.tabAnchor_Heatmap';

describe('gsva feature', function() {
    //this.retries(2);

    describe('query page', () => {
        beforeEach(() => {
            goToUrlAndSetLocalStorage(CBIOPORTAL_URL, true);
            showGsva();
            waitForStudyQueryPage();
        });

        it('shows GSVA-profile option when selecting study_es_0', () => {
            // somehow reloading the page is needed to turn on the GSVA feature for the first test
            goToUrlAndSetLocalStorage(CBIOPORTAL_URL, true);
            waitForStudyQueryPage();
            checkTestStudy();

            var gsvaProfileCheckbox = $('[data-test=GENESET_SCORE]');
            assert(gsvaProfileCheckbox.isDisplayed());
        });

        it('shows gene set entry component when selecting gsva-profile data type', () => {
            checkTestStudy();
            checkGSVAprofile();

            assert($('h2=Enter Gene Sets:').isDisplayed());
            assert(
                browser.$('[data-test=GENESET_HIERARCHY_BUTTON]').isDisplayed()
            );
            assert($('[data-test=GENESET_VOLCANO_BUTTON]').isDisplayed());
            assert($('[data-test=GENESETS_TEXT_AREA]').isDisplayed());
        });

        it('adds gene set parameter to url after submit', () => {
            checkTestStudy();
            checkGSVAprofile();

            $('[data-test=GENESETS_TEXT_AREA]').setValue(
                'GO_ATP_DEPENDENT_CHROMATIN_REMODELING'
            );
            $('[data-test=geneSet]').setValue('TP53');
            var queryButton = $('[data-test=queryButton]');
            queryButton.waitForEnabled();
            queryButton.click();
            var url = browser.getUrl();
            var regex = /geneset_list=GO_ATP_DEPENDENT_CHROMATIN_REMODELING/;
            assert(url.match(regex));
        });
    });

    describe('GenesetsHierarchySelector', () => {
        before(() => {
            goToUrlAndSetLocalStorage(CBIOPORTAL_URL, true);
            showGsva();
            waitForStudyQueryPage();
            checkTestStudy();
            checkGSVAprofile();
        });

        it('adds gene set name to entry component from hierachy selector', () => {
            openGsvaHierarchyDialog();

            var checkBox = $('*=GO_ATP_DEPENDENT_CHROMATIN_REMODELING');
            checkBox.click();

            // wait for jstree to process the click
            browser.waitUntil(() =>
                checkBox.getAttribute('class').includes('jstree-clicked')
            );

            $('button=Select').click();

            $('span*=All gene sets are valid').waitForExist();

            assert.equal(
                $('[data-test=GENESETS_TEXT_AREA]').getHTML(false),
                'GO_ATP_DEPENDENT_CHROMATIN_REMODELING'
            );
        });

        it('filters gene sets with the GSVA score input field', () => {
            openGsvaHierarchyDialog();

            $('[id=GSVAScore]').setValue('0');
            $('[id=filterButton]').click();
            waitForModalUpdate();

            assert.equal($$('*=GO_').length, 5);

            // reset state
            $('[id=GSVAScore]').setValue('0.5');
            $('[id=filterButton]').click();
            waitForModalUpdate();
        });

        it('filters gene sets with the search input field', () => {
            $('[id=GSVAScore]').setValue('0');
            $('[id=filterButton]').click();
            waitForModalUpdate();

            // note: search inbox hides elements in JTree rather than reload data
            const hiddenBefore = $$('.jstree-hidden').length;
            assert(
                hiddenBefore == 0,
                'The tree should not have hidden elements at this point'
            );

            $('[id=geneset-hierarchy-search]').setValue(
                'GO_ACYLGLYCEROL_HOMEOSTASIS'
            );
            waitForModalUpdate();
            const hiddenAfter = $$('.jstree-hidden').length;
            assert.equal(hiddenAfter, 7);
            assert($('*=GO_ACYLGLYCEROL_HOMEOSTASIS'));

            // reset state
            $('[id=geneset-hierarchy-search]').setValue('');
            $('[id=GSVAScore]').setValue('0.5');
            $('[id=filterButton]').click();
            waitForModalUpdate();
        });

        it('filters gene sets with the gene set pvalue input field', () => {
            $('[id=Pvalue]').setValue('0.0005');
            $('[id=filterButton]').click();
            waitForModalUpdate();
            var after = $$('*=GO_');

            assert.equal($$('*=GO_').length, 0);

            // reset state
            $('[id=Pvalue]').setValue('0.05');
            $('[id=filterButton]').click();
            waitForModalUpdate();
        });

        it('filters gene sets with the gene set percentile select box', () => {
            var modal = $('div.modal-body');
            modal.$('.Select-value-label').click();
            modal.$('.Select-option=100%').click();
            modal.$('[id=filterButton]').click();
            waitForModalUpdate();

            assert.equal($$('*=GO_').length, 2);

            // reset state
            modal.$('.Select-value-label').click();
            modal.$('.Select-option=75%').click();
            modal.$('[id=filterButton]').click();
            waitForModalUpdate();
        });

        describe('skin.geneset_hierarchy.collapse_by_default property', () => {
            it('collapses tree on init when property set to true', () => {
                goToUrlAndSetLocalStorageWithProperty(CBIOPORTAL_URL, true, {
                    skin_geneset_hierarchy_collapse_by_default: true,
                });
                showGsva();
                waitForStudyQueryPage();
                checkTestStudy();
                checkGSVAprofile();
                openGsvaHierarchyDialog();
                var gsvaEntriesNotShown = $$('*=GO_').length === 0;
                assert(gsvaEntriesNotShown);
            });
            it('expands tree on init when property set to false', () => {
                goToUrlAndSetLocalStorageWithProperty(CBIOPORTAL_URL, true, {
                    skin_geneset_hierarchy_collapse_by_default: false,
                });
                showGsva();
                waitForStudyQueryPage();
                checkTestStudy();
                checkGSVAprofile();
                openGsvaHierarchyDialog();
                var gsvaEntriesShown = $$('*=GO_').length > 0;
                assert(gsvaEntriesShown);
            });
            it('expands tree on init when property not defined', () => {
                goToUrlAndSetLocalStorage(CBIOPORTAL_URL, true);
                showGsva();
                waitForStudyQueryPage();
                checkTestStudy();
                checkGSVAprofile();
                openGsvaHierarchyDialog();
                var gsvaEntriesShown = $$('*=GO_').length > 0;
                assert(gsvaEntriesShown);
            });
        });
    });

    describe('GenesetVolcanoPlotSelector', function() {
        this.retries(0);

        before(() => {
            goToUrlAndSetLocalStorage(CBIOPORTAL_URL, true);
            showGsva();
            waitForStudyQueryPage();
            checkTestStudy();
            checkGSVAprofile();
        });

        it('adds gene set name to entry component', () => {
            openGsvaVolcanoDialog();
            // find the GO_ATP_DEPENDENT_CHROMATIN_REMODELING entry and check its checkbox
            $('span=GO_ATP_DEPENDENT_CHROMATIN_REMODELING').waitForExist();
            var checkBox = $('span=GO_ATP_DEPENDENT_CHROMATIN_REMODELING')
                .$('..')
                .$('..')
                .$$('td')[3]
                .$('label input');
            checkBox.waitForDisplayed();
            browser.waitUntil(() => {
                checkBox.click();
                return checkBox.isSelected();
            });

            $('button=Add selection to the query').waitForExist();
            $('button=Add selection to the query').click();

            $('span*=All gene sets are valid').waitForExist();

            var textArea = $('[data-test=GENESETS_TEXT_AREA]');
            textArea.waitForExist();
            assert.equal(
                textArea.getHTML(false),
                'GO_ATP_DEPENDENT_CHROMATIN_REMODELING'
            );
        });

        it('selects gene sets from query page text area', () => {
            openGsvaVolcanoDialog();

            var checkBox = $('span=GO_ATP_DEPENDENT_CHROMATIN_REMODELING')
                .$('..')
                .$('..')
                .$$('td')[3]
                .$('label input');

            assert(checkBox.isSelected());
        });

        it('reset keeps gene sets from query page text area', () => {
            var checkBox = $('span=GO_ATP_DEPENDENT_CHROMATIN_REMODELING')
                .$('..')
                .$('..')
                .$$('td')[3]
                .$('label input');
            $('button=Clear selection').click();

            assert(checkBox.isSelected());
        });

        it('searchbox filters gene set list', () => {
            const lengthBefore = jq('td span:contains("GO_")').length;

            assert.equal(lengthBefore, 5);

            $('input.tableSearchInput').waitForExist();
            $('input.tableSearchInput').setValue('GO_ACYL');

            browser.waitUntil(
                () => jq('td span:contains("GO_")').length < lengthBefore,
                {
                    timeout: 10000,
                }
            );

            const lengthAfter = jq('td span:contains("GO_")').length;
            assert.equal(lengthAfter, 1);
        });
    });

    describe('results view page', () => {
        beforeEach(() => {
            goToUrlAndSetLocalStorage(oncoprintTabUrl, true);
            waitForOncoprint();
        });

        it('shows co-expression tab when genes with expression data selected', () => {
            assert($('ul.nav-tabs li.tabAnchor_coexpression'));
        });
    });

    describe('oncoprint tab', () => {
        beforeEach(() => {
            goToUrlAndSetLocalStorage(oncoprintTabUrl, true);
            waitForOncoprint();
        });

        it('has GSVA profile option in heatmap menu', () => {
            var addTracksButton = $('button[id=addTracksDropdown]');
            addTracksButton.waitForExist();
            addTracksButton.click();

            var addTracksMenu = $(ADD_TRACKS_HEATMAP_TAB);
            addTracksMenu.waitForExist();
            addTracksMenu.click();

            var heatmapDropdown = $$('.Select-control')[0];
            heatmapDropdown.waitForExist();
            heatmapDropdown.click();
            assert(
                $(
                    'div=GSVA scores on oncogenic signatures gene sets'
                ).isDisplayed()
            );
        });
    });

    describe('plots tab', () => {
        beforeEach(() => {
            goToUrlAndSetLocalStorage(plotsTabUrl, true);
            waitForPlotsTab();
        });

        it('shows gsva option in horizontal data type selection box', () => {
            var horzDataSelect = $('[name=h-profile-type-selector]').$('..');
            horzDataSelect.$('.Select-arrow-zone').click();
            assert(horzDataSelect.$('.Select-option=Gene Sets'));
        });

        it('shows gsva option in vertical data type selection box', () => {
            var vertDataSelect = $('[name=v-profile-type-selector]').$('..');
            vertDataSelect.$('.Select-arrow-zone').click();
            assert(vertDataSelect.$('.Select-option=Gene Sets'));
        });

        it('horizontal axis menu shows gsva score and pvalue in profile menu', () => {
            var horzDataSelect = $('[name=h-profile-type-selector]').$('..');
            horzDataSelect.$('.Select-arrow-zone').click();
            horzDataSelect.$('.Select-option=Gene Sets').click();

            var horzProfileSelect = $('[name=h-profile-name-selector]').$('..');
            horzProfileSelect.$('.Select-arrow-zone').click();

            assert(
                horzProfileSelect.$(
                    '.Select-option=GSVA scores on oncogenic signatures gene sets'
                )
            );
            assert(
                horzProfileSelect.$(
                    '.Select-option=Pvalues of GSVA scores on oncogenic signatures gene sets'
                )
            );
        });

        it('vertical axis menu shows gsva score and pvalue in profile menu', () => {
            var vertDataSelect = $('[name=v-profile-type-selector]').$('..');
            vertDataSelect.$('.Select-arrow-zone').click();
            vertDataSelect.$('.Select-option=Gene Sets').click();

            var vertProfileSelect = $('[name=v-profile-name-selector]').$('..');
            vertProfileSelect.$('.Select-arrow-zone').click();

            assert(
                vertProfileSelect.$(
                    '.Select-option=GSVA scores on oncogenic signatures gene sets'
                )
            );
            assert(
                vertProfileSelect.$(
                    '.Select-option=Pvalues of GSVA scores on oncogenic signatures gene sets'
                )
            );
        });

        it('horizontal axis menu shows gene set entry in entity menu', () => {
            var horzDataSelect = $('[name=h-profile-type-selector]').$('..');
            horzDataSelect.$('.Select-arrow-zone').click();
            horzDataSelect.$('.Select-option=Gene Sets').click();

            var horzProfileSelect = $('[name=h-profile-name-selector]').$('..');
            horzProfileSelect.$('.Select-arrow-zone').click();
            var profileMenuEntry =
                '.Select-option=Pvalues of GSVA scores on oncogenic signatures gene sets';
            horzProfileSelect.$(profileMenuEntry).waitForExist();
            horzProfileSelect.$(profileMenuEntry).click();

            var horzEntitySelect = $('[name=h-geneset-selector]').$('..');
            horzEntitySelect.$('.Select-arrow-zone').click();
            var entityMenuEntry =
                '.Select-option=GO_ATP_DEPENDENT_CHROMATIN_REMODELING';
            horzEntitySelect.$(entityMenuEntry).waitForExist();

            assert(horzEntitySelect.$(entityMenuEntry));
        });

        it('vertical axis menu shows gene set entry in entity menu', () => {
            var vertDataSelect = $('[name=v-profile-type-selector]').$('..');
            vertDataSelect.$('.Select-arrow-zone').click();
            vertDataSelect.$('.Select-option=Gene Sets').click();

            var vertProfileSelect = $('[name=v-profile-name-selector]').$('..');
            vertProfileSelect.$('.Select-arrow-zone').click();
            var profileMenuEntry =
                '.Select-option=Pvalues of GSVA scores on oncogenic signatures gene sets';
            vertProfileSelect.$(profileMenuEntry).waitForExist();
            vertProfileSelect.$(profileMenuEntry).click();

            var vertEntitySelect = $('[name=v-geneset-selector]').$('..');
            vertEntitySelect.$('.Select-arrow-zone').click();
            var entityMenuEntry =
                '.Select-option=GO_ATP_DEPENDENT_CHROMATIN_REMODELING';
            vertEntitySelect.$(entityMenuEntry).waitForExist();

            assert(vertEntitySelect.$(entityMenuEntry));
        });
    });

    describe('co-expression tab', () => {
        beforeEach(() => {
            goToUrlAndSetLocalStorage(coexpressionTabUrl, true);
            waitForCoExpressionTab();
        });

        it('shows buttons for genes', () => {
            const genes = coexpressionTabUrl
                .match(/gene_list=(.*)\&/)[1]
                .split('%20');
            var container = $('//*[@id="coexpressionTabGeneTabs"]');
            var icons = genes.map(g => container.$('a=' + g));
            assert.equal(genes.length, icons.length);
        });

        it('shows buttons for genes and gene sets', () => {
            const geneSets = coexpressionTabUrl
                .match(/geneset_list=(.*)\&/)[1]
                .split('%20');
            var container = $('//*[@id="coexpressionTabGeneTabs"]');
            var icons = geneSets.map(g => container.$('a=' + g));
            assert.equal(geneSets.length, icons.length);
        });

        it('shows mRNA expression/GSVA scores in query profile select box when reference gene selected', () => {
            var icon = $('//*[@id="coexpressionTabGeneTabs"]').$('a=RPS11');
            icon.click();
            $('//*[@id="coexpressionTabGeneTabs"]').waitForExist();

            assert.equal(
                getReactSelectOptions($('.coexpression-select-query-profile'))
                    .length,
                2
            );
            assert(
                reactSelectOption(
                    $('.coexpression-select-query-profile'),
                    'mRNA expression (microarray) (526 samples)'
                )
            );
            assert(
                reactSelectOption(
                    $('.coexpression-select-query-profile'),
                    'GSVA scores on oncogenic signatures gene sets (5 samples)'
                )
            );
        });

        it('shows mRNA expression in subject profile select box when reference gene selected', () => {
            var icon = $('//*[@id="coexpressionTabGeneTabs"]').$('a=RPS11');
            icon.click();
            $('//*[@id="coexpressionTabGeneTabs"]').waitForExist();
            assert.equal(
                getReactSelectOptions($('.coexpression-select-subject-profile'))
                    .length,
                1
            );
            assert(
                reactSelectOption(
                    $('.coexpression-select-subject-profile'),
                    'mRNA expression (microarray) (526 samples)'
                )
            );
        });

        it('shows name of gene in `correlated with` field when reference gene selected', () => {
            var icon = $('//*[@id="coexpressionTabGeneTabs"]').$('a=RPS11');
            icon.click();
            $('//*[@id="coexpressionTabGeneTabs"]').waitForExist();
            var text = $('span*=that are correlated').getText();
            assert(text.match('RPS11'));
        });

        it('shows mRNA expression/GSVA scores in subject profile box when reference gene set selected', () => {
            var icon = $('//*[@id="coexpressionTabGeneTabs"]').$(
                'a=GO_ACYLGLYCEROL_HOMEOSTASIS'
            );
            icon.click();
            $('//*[@id="coexpressionTabGeneTabs"]').waitForExist();
            assert.equal(
                getReactSelectOptions($('.coexpression-select-query-profile'))
                    .length,
                2
            );
            assert(
                reactSelectOption(
                    $('.coexpression-select-query-profile'),
                    'mRNA expression (microarray) (526 samples)'
                )
            );
            assert(
                reactSelectOption(
                    $('.coexpression-select-query-profile'),
                    'GSVA scores on oncogenic signatures gene sets (5 samples)'
                )
            );
        });

        it('shows disabled subject query select box when reference gene set selected', () => {
            var icon = $('//*[@id="coexpressionTabGeneTabs"]').$(
                'a=GO_ACYLGLYCEROL_HOMEOSTASIS'
            );
            icon.click();
            $('//*[@id="coexpressionTabGeneTabs"]').waitForExist();
            assert($('.coexpression-select-subject-profile.is-disabled '));
            assert(
                $('.coexpression-select-subject-profile').$(
                    '.Select-value-label*=GSVA scores on oncogenic'
                )
            );
        });

        it('shows gene sets in table when GSVA scores selected in subject profile select box', () => {
            selectReactSelectOption(
                $('.coexpression-select-query-profile'),
                'GSVA scores on oncogenic signatures gene sets (5 samples)'
            );
            $('//*[@id="coexpressionTabGeneTabs"]').waitForExist();

            assert.equal(jq('td span:contains("GO_")').length, 7);
        });

        it('shows `Enter gene set.` placeholder in table search box when GSVA scores selected in first select box', () => {
            selectReactSelectOption(
                $('.coexpression-select-query-profile'),
                'GSVA scores on oncogenic signatures gene sets (5 samples)'
            );
            $('//*[@id="coexpressionTabGeneTabs"]').waitForExist();
            assert(
                $(
                    '[data-test=CoExpressionGeneTabContent] input[placeholder="Enter gene set.."]'
                )
            );
        });
    });
});

const checkTestStudy = () => {
    // check the'Test study es_0' checkbox
    $('span=Test study es_0').waitForExist();
    var checkbox = $('span=Test study es_0')
        .$('..')
        .$('input[type=checkbox]');
    checkbox.click();
    clickQueryByGeneButton();
    waitForGeneQueryPage();
};

const checkGSVAprofile = () => {
    $('[data-test=GENESET_SCORE]').waitForExist();
    var gsvaProfileCheckbox = $('[data-test=GENESET_SCORE]');
    gsvaProfileCheckbox.click();
    $('[data-test=GENESETS_TEXT_AREA]').waitForExist();
};

const openGsvaHierarchyDialog = () => {
    $('button[data-test=GENESET_HIERARCHY_BUTTON]').click();
    $('div.modal-dialog').waitForExist();
    $('div[data-test=gsva-tree-container] ul').waitForExist();
    waitForModalUpdate();
};

const openGsvaVolcanoDialog = () => {
    $('button[data-test=GENESET_VOLCANO_BUTTON]').waitForExist();
    $('button[data-test=GENESET_VOLCANO_BUTTON]').click();
    $('div.modal-dialog').waitForExist();
};

module.exports = {
    checkTestStudy: checkTestStudy,
    checkGSVAprofile: checkGSVAprofile,
    queryPageUrl: CBIOPORTAL_URL,
    oncoprintTabUrl: oncoprintTabUrl,
    plotsTabUrl: plotsTabUrl,
    coexpressionTabUrl: coexpressionTabUrl,
};

function waitForModalUpdate() {
    browser.waitUntil(() => $$('.sk-spinner').length === 0, { timeout: 10000 });
}
