import React, {Component} from 'react'
let block = require("bem-cn")
import {extend, defaults, clamp, get, map, omit} from 'lodash'
import {message, Modal, Button} from 'antd'
import {
    Hits,
    InitialLoader,
    HitItemProps,
    SearchkitManager,
    SearchkitProvider,
    SearchBox,
    RefinementListFilter,
    Pagination,
    HierarchicalMenuFilter,
    HitsStats,
    SortingSelector,
    NoHits,
    ResetFilters,
    RangeFilter,
    NumericRefinementListFilter,
    ViewSwitcherToggle,
    DynamicRangeFilter,
    InputFilter,
    GroupedSelectedFilters,
    Layout,
    TopBar,
    LayoutBody,
    LayoutResults,
    ActionBar,
    ActionBarRow,
    SideBar,
    ItemList,
    MenuFilter,
    TagCloud,
    ItemHistogramList,
    CheckboxItemList,
    Select,
    SearchkitComponent,
    PageSizeSelector,
    Toggle,
    Panel,
    Tabs,
    RangeSliderHistogramInput,
    RangeSliderInput,
    RangeHistogramInput,
    RangeInput,
    CheckboxFilter,
    TermQuery,
    RangeAccessor,
    RangeQuery,
    BoolMust,
    BoolShould,
    HistogramBucket,
    CardinalityMetric,
    FilterBucket,
    renderComponent,
    NumberInput
} from 'searchkit'

import './App.css'

const searchkit = new SearchkitManager("/", {
    httpHeaders:{}
})

class TranslateInputFilter extends InputFilter {
    constructor(props) {
        super(props)
        this.searchQuery = this.searchQuery.bind(this)
    }

    searchQuery(query) {
        let me = this;
        let appid = '20170822000075722';
        let key = 'Ww4qy286hL363gB1sQoT';
        let salt = (new Date).getTime();
        var sign = md5(appid + query + salt + key);

        $.ajax({
            url: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
            type: 'get',
            dataType: 'jsonp',
            data: {
                q: query,
                from: 'zh',
                to: 'en',
                appid: appid,
                salt: salt,
                sign: sign
            },
            success: function (data) {
                let trans_query = data.trans_result[0].dst;
                let shouldResetOtherState = false
                me.accessor.setQueryString(trans_query, shouldResetOtherState)
                let now = +new Date
                let newSearch = now - this.lastSearchMs <= 2000
                me.lastSearchMs = now
                me.searchkit.performSearch(newSearch)
            }
        });
    }
}

class CustomNumberInput extends NumberInput {
    constructor(props) {
        super(props)
        this.isValid = this.isValid.bind(this)
        this.onChange = this.onChange.bind(this)
        this.onBlur = this.onBlur.bind(this)
    }

    isValid(value) {
        value = '' + value
        return ('' + parseInt(value, 10) == value)
    }

    onChange(e) {
        const {field, onChange} = this.props
        const value = e.target.value
        this.setState({value})
        if (this.isValid(value) && onChange) {
            //onChange(value, field)
        }
    }

    onBlur(e) {
        const {field, onChange} = this.props
        const value = e.target.value
        this.setState({value})
        if (this.isValid(value) && onChange) {
            onChange(value, field)
        }
    }

    render() {
        const rest = omit(this.props, ['field', 'onChange'])
        return <input type="number" {...rest} value={this.state.value} onChange={this.onChange} onBlur={this.onBlur}/>
    }
}

class CustomRangeInput extends RangeInput {
    constructor(props) {
        super(props)
        this.handleInputChange = this.handleInputChange.bind(this)
    }

    handleInputChange(value, key) {
        const {min, max, minValue, maxValue, onFinished, onChange} = this.props
        const values = defaults({
            //[key]: clamp(value, min, max)
            [key]: value
        }, {
            min: minValue, max: maxValue
        })
        onFinished(values)
        //onChange(values)
    }

    render() {
        const {mod, className, minValue, maxValue, translate, minPlaceholder, maxPlaceholder} = this.props

        const bemBlocks = {
            container: block(mod)
        }

        return (
            <form className={bemBlocks.container().mix(className) } onSubmit={this.handleSubmit}>
                <CustomNumberInput ref="min" className={bemBlocks.container("input") }
                                   value={minValue}
                                   field="min"
                                   onChange={this.handleInputChange}
                                   placeholder={translate('range.min') || minPlaceholder}/>
                <div className={bemBlocks.container("to-label")}>{translate('range.to') || '-'}</div>
                <CustomNumberInput ref="max" className={bemBlocks.container("input")}
                                   value={maxValue}
                                   field="max"
                                   onChange={this.handleInputChange}
                                   placeholder={translate('range.max') || maxPlaceholder }/>
                <button type="submit" className={bemBlocks.container("submit")}>{ translate('range.submit') || 'Go'}</button>
            </form>
        )
    }

}

class CustomRangeAccessor extends RangeAccessor {
    constructor(key, options) {
        super(key, options)
        this.buildSharedQuery = this.buildSharedQuery.bind(this)
        this.buildOwnQuery = this.buildOwnQuery.bind(this)
    }

    buildSharedQuery(query) {
        if (this.state.hasValue()) {
            let val = this.state.getValue()

            let rangeFilter = this.fieldContext.wrapFilter(
                BoolShould([
                    RangeQuery(this.options.field, {
                        gte: val.min,
                        lte: val.max
                    }), BoolMust([
                        RangeQuery(this.options.field, {gte: val.max}),
                        RangeQuery(this.options.minField, {lte: val.max})
                    ])
                ])
            )
            if(val.min>val.max){
                rangeFilter = this.fieldContext.wrapFilter(
                    RangeQuery(this.options.field, {
                        gte: -999,
                        lte: -999
                    })
                )
            }

            let selectedFilter = {
                name: this.translate(this.options.title),
                value: `${val.min} - ${val.max}`,
                id: this.options.id,
                remove: () => {
                    this.state = this.state.clear()
                }
            }
            return query
                .addFilter(this.key, rangeFilter)
                .addSelectedFilter(selectedFilter)

        }
        return query
    }

    buildOwnQuery(query) {
        let otherFilters = query.getFiltersWithoutKeys(this.key)

        let rangeFilter = this.fieldContext.wrapFilter(
            BoolShould([
                RangeQuery(this.options.field, {
                    gte: this.options.min,
                    lte: this.options.max
                }), BoolMust([
                    RangeQuery(this.options.field, {gte: this.options.max}),
                    RangeQuery(this.options.minField, {lte: this.options.max})
                ])
            ])
        )

        let filters = BoolMust([
            otherFilters,
            rangeFilter
        ])

        let metric

        if (this.options.loadHistogram) {
            metric = HistogramBucket(this.key, this.options.field, {
                "interval": this.getInterval(),
                "min_doc_count": 0,
                "extended_bounds": {
                    "min": this.options.min,
                    "max": this.options.max
                }
            })
        } else {
            metric = CardinalityMetric(this.key, this.options.field)
        }

        return query.setAggs(FilterBucket(
            this.key,
            filters,
            ...this.fieldContext.wrapAggregations(metric)
        ))
    }
}

class CustomRangeFilter extends RangeFilter {
    constructor(props) {
        super(props)
        this.defineAccessor = this.defineAccessor.bind(this)
        this.renderRangeComponent = this.renderRangeComponent.bind(this)
    }

    defineAccessor() {
        const {
            id, title, min, max, field, minField, fieldOptions,
            interval, showHistogram
        } = this.props
        if (minField) {
            return new CustomRangeAccessor(id, {
                id, min, max, title, field, minField,
                interval, loadHistogram: showHistogram, fieldOptions
            })
        } else {
            return new RangeAccessor(id, {
                id, min, max, title, field, minField,
                interval, loadHistogram: showHistogram, fieldOptions
            })
        }

    }

    renderRangeComponent(component) {
        const {min, max, rangeFormatter, marks} = this.props
        const state = this.accessor.state.getValue()
        return renderComponent(component, {
            min, max,
            minValue: Number(get(state, "min", min)),
            maxValue: Number(get(state, "max", max)),
            items: this.accessor.getBuckets(),
            onChange: this.sliderUpdate,
            onFinished: this.sliderUpdateAndSearch,
            rangeFormatter, marks,
            translate: this.translate
        })
    }
}

const ProfessorHitsListItem = (props) => {
    const {bemBlocks, result} = props
    let url = "professors/" + result._source.index
    const {index, name, email, phone, sex, age, edu_chinese, title_chinese, eol3_chinese, university_chinese, university_rank, academic_rank} = result._source;
    return (
        <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
            <div className={bemBlocks.item("details")}>
                <ul className="search_results">
                    <div className="name_one_row">
                    	<span>
                            <label>
                                <a href={url} target="_blank">
	                                <li className={bemBlocks.item("title")}> &nbsp;{name}</li>
	                            </a>
                            </label>
                        </span>
                    </div>
                    <li className="one_col">
                        <span>
                            <div>
                                <img src="/static/img/icon/briefcase-100.png" title="Briefcase" width="20" height="20" alt=""/>
                                <li> 学历：&nbsp;{edu_chinese ? edu_chinese : "其他"} </li>
                            </div>
                        </span>
                        <span>
                            <img src="/static/img/icon/book-100.png" title="Book" width="20" height="20" alt=""/>
                       	 	专业：&nbsp;{eol3_chinese ? eol3_chinese : "未知"}({academic_rank? academic_rank: "未知"})
                        </span>
                        <span>
                            <img src="/static/img/icon/university-100.png"
                                 title="University"
                                 width="20" height="20" alt=""/>
                     	    大学：&nbsp;{university_chinese}&nbsp;&nbsp;
                 	    	大学世界排名：&nbsp;{university_rank ? university_rank: "未知"}
                        </span>
                        <span style={{"display":"none"}} className="world_ranking">大学世界排名：&nbsp;{university_rank ? university_rank: "未知"}</span>
                    </li>
                    <li className="two_col">
                        <span>性别：&nbsp;{sex ? sex : "未知"}</span>
                        <span>邮箱：&nbsp;{email ? email : "未知"}</span>
                        <span>职称：&nbsp;{title_chinese ? title_chinese : "未知"}</span>
                    </li>
                    <li className="three_col">
                        <span>电话：&nbsp;{phone ? phone : "未知"}</span>
                        <span>年龄：&nbsp;{age ? age : "未知"}</span>
                    </li>
                    <li className="four_col" style={{"display":"none"}}>
                    	<span>
                            <li className="edit">编辑</li>
                            <li className="down_load">下载</li>
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    )
}

class App extends Component {

    constructor(props) {
        super(props)
        this.state = {
            visible: false
        }
        this.allSelect = this.allSelect.bind(this);
    }

    showModal() {
        this.setState({
            visible: true,
        });
    }

    handleOk(e) {
        this.setState({
            visible: false,
        });
    }

    handleCancel(e) {
        this.setState({
            visible: false,
        });
    }

    handleClick(event) {
        //searchkit.reloadSearch()
        searchkit.performSearch()
    }
	
    //全选点击函数
    allSelect(event) {
        console.log('全选点击');
        console.log(this);
        event.stopPropagation();
    }
    
    render() {
        return (
            <SearchkitProvider searchkit={searchkit}>
                <Layout className="app">
                    <TopBar>
                        <ul className="topbar topbar-nav">
                            <li>
                            	<img id="logo" src="/static/img/logo.png" width="auto" height="40" alt="I-Future Logo"/>
                        	</li>
                            <li>
                            	<img id="logo" src="/static/img/academicBridgelogo.png" width="auto" height="40" alt="I-Future Logo"/>
                            </li>
                            <li>
                           		<img id="logo" src="/static/img/EOLlogo.png" width="auto" height="40" alt="I-Future Logo"/>
                            </li>
                        </ul>
                        <ul className="topbar topbar-nav topbar-right">
                            <li><a href="/pages/profile">账号</a></li>
                            <li><a href="/user/sign-out">注销</a></li>
                        </ul>
                    </TopBar>
                    <LayoutBody>
                        <div className="sk-layout__content">
                            <div className="sk-layout__title">
                                <p><img src="/static/img/title.png" alt="title"/>海外高端人才大数据平台</p>
                            </div>
                            <SideBar className="sk-filters-wraper">
                                <Panel collapsable={false} defaultCollapsed={false}>
                                    <ul>
	                                    <li className="one_row">
	                                        <span>
	                                            <strong className="title">学历：</strong>
	                                            <MenuFilter title="学历" id="edu_chinese"
	                                                        translations={{"All": " 不限"}}
	                                                        field="edu_chinese.raw"
	                                                        listComponent={Select}/>
	                                        </span>
	                                        <span>
	                                        	<strong className="title">职称：</strong>
	                                            <MenuFilter title="职称" id="title_chinese"
	                                                        translations={{"All": " 不限"}}
	                                                        field={"title_chinese.raw"}
	                                                        listComponent={Select}/>
	                                        </span>
	                                        <span className="three_col last">
	                                            <ul className="component-inline-wraper">
	                                                <li>
	                                                    <MenuFilter title="学科领域" id="eol1_chinese"
	                                                                translations={{"All": " 不限"}}
	                                                                field={"eol1_chinese.raw"}
	                                                                listComponent={Select}/>
	                                                </li>
	                                                <li className="center">
	                                                    <MenuFilter title="&nbsp;" id="eol2_chinese"
	                                                                translations={{"All": " 不限"}}
	                                                                field={"eol2_chinese.raw"}
	                                                                listComponent={Select}/>
	                                                </li>
                                                    <li>
                                                        <MenuFilter title="&nbsp;" id="eol3_chinese"
                                                                    translations={{"All": " 不限"}}
                                                                    field={"eol3_chinese.raw"}
                                                                    listComponent={Select}/>
                                                    </li>
	                                            </ul>
                                                <strong className="title">学科领域：</strong>
	                                        </span>
	                                    </li>
	                                    <li className="two_row">
                                            <span style={{"width":"24%"}}>
                                                <strong className="title">在职大学：</strong>
                                                <InputFilter title="在职大学" id="university"
                                                             placeholder="在职大学"
                                                             searchOnChange={false}
                                                             prefixQueryFields={["university_chinese"]}
                                                             queryFields={["university",
                                                                 "university_chinese"]}/>
                                            </span>
	                                    	<span className="one_col" style={{"width":"30%"}}>
	                                            <strong className="title">所在大学排名：</strong>
	                                            <CustomRangeFilter title="所在大学排名"
	                                                               id="range_university_rank"
	                                                               field="university_rank_max"
	                                                               minField="university_rank_min"
	                                                               min={1}
	                                                               max={100}
	                                                               translations={{
	                                                                   "range.to": "至",
	                                                                   "range.min": "最小值",
	                                                                   "range.max": "最大值"
	                                                               }}
	                                                               showHistogram={false}
	                                                               rangeComponent={CustomRangeInput}/>
	                                        </span>
	                                        <span className="three_col last" style={{"width":"46%"}}>
	                                            <ul className="component-inline-wraper">
	                                                <li>
	                                                    <MenuFilter title="目前工作地点" id="country_chinese2"
	                                                                translations={{"All": " 国家"}}
	                                                                field={"country_chinese.raw"}
	                                                                listComponent={Select}/>
	                                                </li>
	                                                <li style={{"marginLeft":"15px"}}>
	                                                    <MenuFilter title="&nbsp;" id="state_chinese"
	                                                                translations={{"All": " 地区不限"}}
	                                                                field={"state_chinese.raw"}
	                                                                listComponent={Select}/>
	                                                </li>
	                                            </ul>
                                                <strong className="title">目前工作地点：</strong>
	                                        </span>
	                                    </li>
	                                    <li className="three_row">
                                            <span className="two_col" style={{"width":"25%"}}>
                                                <strong className="title">电子邮箱：</strong>
                                                <InputFilter title="电子邮箱" id="email"
                                                             placeholder="电子邮箱"
                                                             searchOnChange={false}
                                                             queryFields={["email"]}/>
                                            </span>
	                                        <span className="one_col" style={{"width":"25%"}}>
	                                        	<strong className="title">年龄：</strong>
	                                            <CustomRangeFilter title="年龄" id="range_age"
	                                                               field="age_max"
	                                                               minField="age_min"
	                                                               min={20} max={35}
	                                                               translations={{
	                                                                   "range.to": "至",
	                                                                   "range.min": "最小值",
	                                                                   "range.max": "最大值"
	                                                               }}
	                                                               showHistogram={false}
	                                                               rangeComponent={CustomRangeInput}/>
	                                        </span>
	                                        <span className="three_col" style={{"width":"18%","display":"none"}}>
                                                <strong className="title">性别：</strong>
                                                <MenuFilter title="性别" id="sex_chinese"
                                                            translations={{"All": " 不限"}}
                                                            field="sex_chinese.raw"
                                                            listComponent={Select}/>
                                            </span>
	                                        <span className="four_col" style={{"width":"20%"}}>
                                                <strong className="title">姓名：</strong>
                                                <InputFilter title="姓名" id="name" placeholder="姓名"
                                                             searchOnChange={false}
                                                             prefixQueryFields={["name"]}
                                                             queryFields={["name"]}/>
                                            </span>
                                            <span className="two_col" style={{"width":"30%"}}>
                                                <strong className="title">学科排名：</strong>
                                                <CustomRangeFilter title="学科排名"
                                                                   id="range_subject_rank"
                                                                   field="academic_rank_max"
                                                                   minField="academic_rank_min"
                                                                   min={1}
                                                                   max={100}
                                                                   translations={{
                                                                       "range.to": "至",
                                                                       "range.min": "最小值",
                                                                       "range.max": "最大值"
                                                                   }}
                                                                   showHistogram={false}
                                                                   rangeComponent={CustomRangeInput}/>
                                            </span>
	                                    </li>
	                                    <li className="four_row">
	                                    	<span style={{"display":"none"}}>
                                                <strong className="title">简历详细度：</strong>
	                                            <ul className="component-inline-wraper">
	                                                <li>
	                                                    <CheckboxFilter id="detail_degree_1" title="简历详细度"
	                                                                    label="详细"
	                                                                    filter={TermQuery("detail_degree_1",
	                                                                        '是')}/>
	                                                </li>
	                                                <li>
	                                                    <CheckboxFilter id="detail_degree_2" title="&nbsp;"
	                                                                    label="一般"
	                                                                    filter={TermQuery("detail_degree_2",
	                                                                        '是')}/>
	                                                </li>
	                                                <li>
	                                                    <CheckboxFilter id="detail_degree_3" title="&nbsp;"
	                                                                    label="不详细"
	                                                                    filter={TermQuery("detail_degree_3",
	                                                                        '是')}/>
	                                                </li>
	                                            </ul>
	                                        </span>
	                                        <span className="two_col" style={{"width":"50%"}}>
                                                <strong className="title">论文分区：</strong>
	                                            <ul className="component-inline-wraper">
	                                                <li>
	                                                    <CheckboxFilter id="have_zone_1" title="论文分区"
	                                                                    label="一区"
	                                                                    filter={TermQuery("have_zone_1",
	                                                                        '是')}/>
	                                                </li>
	                                                <li>
	                                                    <CheckboxFilter id="have_zone_2" title="&nbsp;"
	                                                                    label="二区"
	                                                                    filter={TermQuery("have_zone_2",
	                                                                        '是')}/>
	                                                </li>
	                                                <li>
	                                                    <CheckboxFilter id="have_zone_3" title="&nbsp;"
	                                                                    label="三区"
	                                                                    filter={TermQuery("have_zone_3",
	                                                                        '是')}/>
	                                                </li>
	                                                <li>
	                                                    <CheckboxFilter id="have_zone_4" title="&nbsp;"
	                                                                    label="四区"
	                                                                    filter={TermQuery("have_zone_4",
	                                                                        '是')}/>
	                                                </li>
	                                            </ul>
	                                        </span>
	                                        <span className="dark_search five_col" style={{"width":"30%"}}>
                                                <TranslateInputFilter title="&nbsp;" id="other"
                                                                      placeholder="模糊检索"
                                                                      searchOnChange={false}
                                                                      queryFields={["department_chinese^5",
                                                                          "research^2", 
                                                                          "publication^2",
                                                                          "summary_linkedin",
                                                                          "experience_linkedin",
                                                                          "education_linkedin",
                                                                          "publication_google"]}
                                                                      queryOptions={{default_operator: "AND"}}/>
                                            </span>
	                                    </li>
	                                    <li className="five_row">
	                                        <p>
	                                            <div>
	                                                <button className="sk-btn" onClick={this.handleClick}>
	                                                   	检&nbsp;&nbsp;索
	                                                </button>
	                                            </div>
	                                        </p>
	                                    </li>
                                    </ul>
                                </Panel>
                            </SideBar>
                            <LayoutResults>
                                <ActionBar>
                                    <ActionBarRow>
                                        <HitsStats translations={{ "hitstats.results_found": "发现 {hitCount} 结果" }}/>
                                        <span id="ranking">排名根据</span>
                                        <SortingSelector options={[
                                            {
                                                label: "相关度",
                                                key: "RelevanceRanking",
                                                fields: [
                                                    {field: "index", options: {order: "asc"}},
                                                    {field: "_score", options: {order: "desc"}}
                                                ],
                                                defaultOption: true
                                            },
                                            {
                                                label: "学科",
                                                key: "AcademicRanking",
                                                fields: [
                                                    {field: "academic_rank_min", options: {order: "asc"}},
                                                    {field: "university_rank_min", options: {order: "asc"}},
                                                    {field: "_score", options: {order: "desc"}}
                                                ]
                                            },
                                            {
                                                label: "大学",
                                                key: "UniversityRank",
                                                fields: [
                                                    {field: "university_rank_min", options: {order: "asc"}},
                                                    {field: "academic_rank_min", options: {order: "asc"}},
                                                    {field: "_score", options: {order: "desc"}}
                                                ]
                                            }
                                        ]}/>
                                        <div className="handle">
                                            <span style={{"display":"none"}}>
                                                <label onClick={this.allSelect}>
                                                    <input type="checkbox" name="all_select"/> 全选
                                                </label>
                                            </span>
                                            <ActionBarRow>
                                                <ResetFilters translations={{"reset.clear_all": "清除筛选"}}/>
                                            </ActionBarRow>
                                            <div style={{"display":"none"}}>
                                                <span className="download">
                                                    <span>
                                                        <img src="/static/img/download.png" alt="download"/>
                                                        <p>批量下载</p>
                                                    </span>
                                                </span>
                                                <span className="export">
                                                    <span>
                                                        <img src="/static/img/export.png" alt="export"/>
                                                        <p>导出生成Excel表格</p>
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </ActionBarRow>
                                    <GroupedSelectedFilters/>
                                </ActionBar>
                                <Hits
                                    hitsPerPage={10}
                                    mod="sk-hits-list"
                                    highlightFields={["name"]}
                                    sourceFilter={[
                                        "index",
                                        "name",
                                        "email",
                                        "phone",
                                        "photo",
                                        "age",
                                        "age_min",
                                        "age_max",
                                        "university",
                                        "university_chinese",
                                        "university_rank",
                                        "university_rank_min",
                                        "university_rank_max",
                                        "academic_rank",
                                        "academic_rank_min",
                                        "academic_rank_max",
                                        "title",
                                        "title_chinese",
                                        "country_chinese",
                                        "state",
                                        "state_chinese",
                                        "department",
                                        "department_chinese",
                                        "eol1_chinese",
                                        "eol2_chinese",
                                        "eol3_chinese",
                                        "edu_chinese",
                                        "lat",
                                        "long",
                                        "location_linkedin",
                                        "url",
                                        "url_linkedin",
                                        "url_scopus",
                                        "have_zone_1",
                                        "have_zone_2",
                                        "have_zone_3",
                                        "have_zone_4",
                                        "have_zone_others",
                                        "zone_1",
                                        "zone_2",
                                        "zone_3",
                                        "zone_4",
                                        "zone_others",
                                        "research",
                                        "research_area",
                                        "publication",
                                        "first_pub_year",
                                        "education",
                                        "education_linkedin",
                                        "experience_linkedin",
                                        "industry_linkedin",
                                        "occupation_linkedin"
                                    ]}
                                    itemComponent={ProfessorHitsListItem}
                                    scrollTo="body" />
                                <NoHits translations={{"NoHits.NoResultsFound": "抱歉，没有找到结果"}}/>
                                <InitialLoader />
                                <Pagination showNumbers={true} translations={{
                                    "pagination.previous": "上一页",
                                    "pagination.next": "下一页"
                                }}/>
                            </LayoutResults>
                        </div>
                    </LayoutBody>
                </Layout>
            </SearchkitProvider>
        );
    }
}
export default App;