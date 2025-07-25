import { CommonModule } from '@angular/common';
import {
    AfterContentInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostListener,
    inject,
    Input,
    NgModule,
    numberAttribute,
    OnChanges,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    QueryList,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { find, findSingle, focus, hasClass, removeAccents, resolveFieldData } from '@primeuix/utils';
import { BlockableUI, PrimeTemplate, ScrollerOptions, SharedModule, TranslationKeys, TreeDragDropService, TreeNode } from 'primeng/api';
import { AutoFocusModule } from 'primeng/autofocus';
import { BaseComponent } from 'primeng/basecomponent';
import { Checkbox } from 'primeng/checkbox';
import { IconField } from 'primeng/iconfield';
import { ChevronDownIcon, ChevronRightIcon, SearchIcon, SpinnerIcon } from 'primeng/icons';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { Scroller } from 'primeng/scroller';
import { Nullable } from 'primeng/ts-helpers';
import { Subscription } from 'rxjs';
import { TreeStyle } from './style/treestyle';
import {
    TreeFilterEvent,
    TreeLazyLoadEvent,
    TreeNodeCollapseEvent,
    TreeNodeContextMenuSelectEvent,
    TreeNodeDoubleClickEvent,
    TreeNodeDropEvent,
    TreeNodeExpandEvent,
    TreeNodeSelectEvent,
    TreeNodeUnSelectEvent,
    TreeScrollEvent,
    TreeScrollIndexChangeEvent
} from './tree.interface';

@Component({
    selector: 'p-treeNode',
    standalone: true,
    imports: [CommonModule, Ripple, Checkbox, FormsModule, ChevronRightIcon, ChevronDownIcon, SpinnerIcon, SharedModule],
    template: `
        @if (node) {
            <li
                *ngIf="tree.droppableNodes"
                [class]="cx('dropPoint', { param: draghoverPrev })"
                [attr.aria-hidden]="true"
                (drop)="onDropPoint($event, -1)"
                (dragover)="onDropPointDragOver($event)"
                (dragenter)="onDropPointDragEnter($event, -1)"
                (dragleave)="onDropPointDragLeave($event)"
            ></li>
            <li
                [class]="cn(cx('node'), node.styleClass)"
                [ngStyle]="{ height: itemSize + 'px' }"
                [style]="node.style"
                [attr.aria-label]="node.label"
                [attr.aria-checked]="checked"
                [attr.aria-setsize]="node.children ? node.children.length : 0"
                [attr.aria-selected]="selected"
                [attr.aria-expanded]="node.expanded"
                [attr.aria-posinset]="index + 1"
                [attr.aria-level]="level + 1"
                [attr.tabindex]="index === 0 ? 0 : -1"
                [attr.data-id]="node.key"
                role="treeitem"
                (keydown)="onKeyDown($event)"
            >
                <div
                    [class]="cx('nodeContent')"
                    [style.paddingLeft]="level * indentation + 'rem'"
                    (click)="onNodeClick($event)"
                    (contextmenu)="onNodeRightClick($event)"
                    (dblclick)="onNodeDblClick($event)"
                    (touchend)="onNodeTouchEnd()"
                    (drop)="onDropNode($event)"
                    (dragover)="onDropNodeDragOver($event)"
                    (dragenter)="onDropNodeDragEnter($event)"
                    (dragleave)="onDropNodeDragLeave($event)"
                    [draggable]="tree.draggableNodes"
                    (dragstart)="onDragStart($event)"
                    (dragend)="onDragStop($event)"
                >
                    <button type="button" [attr.data-pc-section]="'toggler'" [class]="cx('nodeToggleButton')" (click)="toggle($event)" pRipple tabindex="-1">
                        <ng-container *ngIf="!tree.togglerIconTemplate && !tree._togglerIconTemplate">
                            <ng-container *ngIf="!node.loading">
                                <svg data-p-icon="chevron-right" *ngIf="!node.expanded" [class]="cx('nodeToggleIcon')" />
                                <svg data-p-icon="chevron-down" *ngIf="node.expanded" [class]="cx('nodeToggleIcon')" />
                            </ng-container>
                            <ng-container *ngIf="loadingMode === 'icon' && node.loading">
                                <svg data-p-icon="spinner" [class]="cx('nodeToggleIcon')" spin />
                            </ng-container>
                        </ng-container>
                        <span *ngIf="tree.togglerIconTemplate || tree._togglerIconTemplate" [class]="cx('nodeToggleIcon')">
                            <ng-template *ngTemplateOutlet="tree.togglerIconTemplate || tree._togglerIconTemplate; context: { $implicit: node.expanded, loading: node.loading }"></ng-template>
                        </span>
                    </button>

                    <p-checkbox
                        [ngModel]="isSelected()"
                        [styleClass]="cx('nodeCheckbox')"
                        [binary]="true"
                        [indeterminate]="node.partialSelected"
                        *ngIf="tree.selectionMode == 'checkbox'"
                        [disabled]="node.selectable === false"
                        [variant]="tree?.config.inputStyle() === 'filled' || tree?.config.inputVariant() === 'filled' ? 'filled' : 'outlined'"
                        [attr.data-p-partialchecked]="node.partialSelected"
                        [tabindex]="-1"
                        (click)="$event.preventDefault()"
                    >
                        <ng-container *ngIf="tree.checkboxIconTemplate || tree._checkboxIconTemplate">
                            <ng-template #icon>
                                <ng-template
                                    *ngTemplateOutlet="
                                        tree.checkboxIconTemplate || tree._checkboxIconTemplate;
                                        context: {
                                            $implicit: isSelected(),
                                            partialSelected: node.partialSelected,
                                            class: cx('nodeCheckbox')
                                        }
                                    "
                                ></ng-template>
                            </ng-template>
                        </ng-container>
                    </p-checkbox>

                    <span [class]="getIcon()" *ngIf="node.icon || node.expandedIcon || node.collapsedIcon"></span>
                    <span [class]="cx('nodeLabel')">
                        <span *ngIf="!tree.getTemplateForNode(node)">{{ node.label }}</span>
                        <span *ngIf="tree.getTemplateForNode(node)">
                            <ng-container *ngTemplateOutlet="tree.getTemplateForNode(node); context: { $implicit: node }"></ng-container>
                        </span>
                    </span>
                </div>
                <ul [class]="cx('nodeChildren')" *ngIf="!tree.virtualScroll && node.children && node.expanded" role="group">
                    <p-treeNode
                        *ngFor="let childNode of node.children; let firstChild = first; let lastChild = last; let index = index; trackBy: tree.trackBy.bind(this)"
                        [node]="childNode"
                        [parentNode]="node"
                        [firstChild]="firstChild"
                        [lastChild]="lastChild"
                        [index]="index"
                        [itemSize]="itemSize"
                        [level]="level + 1"
                        [loadingMode]="loadingMode"
                    ></p-treeNode>
                </ul>
            </li>

            <li
                *ngIf="tree.droppableNodes && lastChild"
                [class]="cx('dropPoint', { param: draghoverNext })"
                (drop)="onDropPoint($event, 1)"
                [attr.aria-hidden]="true"
                (dragover)="onDropPointDragOver($event)"
                (dragenter)="onDropPointDragEnter($event, 1)"
                (dragleave)="onDropPointDragLeave($event)"
            ></li>
        }
    `,
    encapsulation: ViewEncapsulation.None,
    providers: [TreeStyle]
})
export class UITreeNode extends BaseComponent implements OnInit {
    static ICON_CLASS: string = 'p-tree-node-icon ';

    @Input() rowNode: any;

    @Input() node: TreeNode<any> | undefined;

    @Input() parentNode: TreeNode<any> | undefined;

    @Input({ transform: booleanAttribute }) root: boolean | undefined;

    @Input({ transform: numberAttribute }) index: number | undefined;

    @Input({ transform: booleanAttribute }) firstChild: boolean | undefined;

    @Input({ transform: booleanAttribute }) lastChild: boolean | undefined;

    @Input({ transform: numberAttribute }) level: number | undefined;

    @Input({ transform: numberAttribute }) indentation: number | undefined;

    @Input({ transform: numberAttribute }) itemSize: number | undefined;

    @Input() loadingMode: string;

    tree: Tree = inject(forwardRef(() => Tree));

    timeout: any;

    draghoverPrev: boolean | undefined;

    draghoverNext: boolean | undefined;

    draghoverNode: boolean | undefined;

    _componentStyle = inject(TreeStyle);

    get selected() {
        return this.tree.selectionMode === 'single' || this.tree.selectionMode === 'multiple' ? this.isSelected() : undefined;
    }

    get checked() {
        return this.tree.selectionMode === 'checkbox' ? this.isSelected() : undefined;
    }

    get nodeClass() {
        return this.tree._componentStyle.classes.node({ instance: this });
    }

    get selectable() {
        return this.node.selectable === false ? false : this.tree.selectionMode != null;
    }

    ngOnInit() {
        super.ngOnInit();
        (<TreeNode>this.node).parent = this.parentNode;
        const nativeElement = this.tree.el.nativeElement;
        const pDialogWrapper = nativeElement.closest('p-dialog');
        if (this.parentNode && !pDialogWrapper) {
            this.setAllNodesTabIndexes();
            this.tree.syncNodeOption(<TreeNode>this.node, <TreeNode<any>[]>this.tree.value, 'parent', this.tree.getNodeWithKey(<string>this.parentNode.key, <TreeNode<any>[]>this.tree.value));
        }
    }

    getIcon() {
        let icon: string | undefined;

        if ((<TreeNode>this.node).icon) icon = (<TreeNode>this.node).icon as string;
        else icon = (<TreeNode>this.node).expanded && (<TreeNode>this.node).children && (<TreeNode>this.node).children?.length ? (<TreeNode>this.node).expandedIcon : (<TreeNode>this.node).collapsedIcon;

        return UITreeNode.ICON_CLASS + ' ' + icon + ' p-tree-node-icon';
    }

    isLeaf() {
        return this.tree.isNodeLeaf(<TreeNode>this.node);
    }

    toggle(event: Event) {
        if ((<TreeNode>this.node).expanded) this.collapse(event);
        else this.expand(event);

        event.stopPropagation();
    }

    expand(event: Event) {
        (<TreeNode>this.node).expanded = true;
        if (this.tree.virtualScroll) {
            this.tree.updateSerializedValue();
            this.focusVirtualNode();
        }
        this.tree.onNodeExpand.emit({ originalEvent: event, node: <TreeNode>this.node });
    }

    collapse(event: Event) {
        (<TreeNode>this.node).expanded = false;
        if (this.tree.virtualScroll) {
            this.tree.updateSerializedValue();
            this.focusVirtualNode();
        }
        this.tree.onNodeCollapse.emit({ originalEvent: event, node: <TreeNode>this.node });
    }

    onNodeClick(event: MouseEvent) {
        this.tree.onNodeClick(event, <TreeNode>this.node);
    }

    onNodeKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.tree.onNodeClick(event, <TreeNode>this.node);
        }
    }

    onNodeTouchEnd() {
        this.tree.onNodeTouchEnd();
    }

    onNodeRightClick(event: MouseEvent) {
        this.tree.onNodeRightClick(event, <TreeNode>this.node);
    }

    onNodeDblClick(event: MouseEvent) {
        this.tree.onNodeDblClick(event, <TreeNode>this.node);
    }

    isSelected() {
        return this.tree.isSelected(<TreeNode>this.node);
    }

    isSameNode(event) {
        return event.currentTarget && (event.currentTarget.isSameNode(event.target) || event.currentTarget.isSameNode(event.target.closest('[role="treeitem"]')));
    }

    onDropPoint(event: DragEvent, position: number) {
        event.preventDefault();
        let dragNode = this.tree.dragNode;
        let dragNodeIndex = this.tree.dragNodeIndex;
        let dragNodeScope = this.tree.dragNodeScope;
        let isValidDropPointIndex = this.tree.dragNodeTree === this.tree ? position === 1 || dragNodeIndex !== <number>this.index - 1 : true;

        if (this.tree.allowDrop(<TreeNode>dragNode, <TreeNode>this.node, dragNodeScope) && isValidDropPointIndex) {
            let dropParams = { ...this.createDropPointEventMetadata(<number>position) };

            if (this.tree.validateDrop) {
                this.tree.onNodeDrop.emit({
                    originalEvent: event,
                    dragNode: dragNode,
                    dropNode: this.node,
                    index: this.index,
                    accept: () => {
                        this.processPointDrop(dropParams);
                    }
                });
            } else {
                this.processPointDrop(dropParams);
                this.tree.onNodeDrop.emit({
                    originalEvent: event,
                    dragNode: dragNode,
                    dropNode: this.node,
                    index: this.index
                });
            }
        }

        this.draghoverPrev = false;
        this.draghoverNext = false;
    }

    processPointDrop(event: any) {
        let newNodeList = event.dropNode.parent ? event.dropNode.parent.children : this.tree.value;
        event.dragNodeSubNodes.splice(event.dragNodeIndex, 1);
        let dropIndex = this.index;

        if (event.position < 0) {
            dropIndex = event.dragNodeSubNodes === newNodeList ? (event.dragNodeIndex > event.index ? event.index : event.index - 1) : event.index;
            newNodeList.splice(dropIndex, 0, event.dragNode);
        } else {
            dropIndex = newNodeList.length;
            newNodeList.push(event.dragNode);
        }

        this.tree.dragDropService.stopDrag({
            node: event.dragNode,
            subNodes: event.dropNode.parent ? event.dropNode.parent.children : this.tree.value,
            index: event.dragNodeIndex
        });
    }

    createDropPointEventMetadata(position: number) {
        return {
            dragNode: this.tree.dragNode,
            dragNodeIndex: this.tree.dragNodeIndex,
            dragNodeSubNodes: this.tree.dragNodeSubNodes,
            dropNode: this.node,
            index: this.index,
            position: position
        };
    }

    onDropPointDragOver(event: any) {
        event.dataTransfer.dropEffect = 'move';
        event.preventDefault();
    }

    onDropPointDragEnter(event: Event, position: number) {
        if (this.tree.allowDrop(<TreeNode>this.tree.dragNode, <TreeNode>this.node, this.tree.dragNodeScope)) {
            if (position < 0) this.draghoverPrev = true;
            else this.draghoverNext = true;
        }
    }

    onDropPointDragLeave(event: Event) {
        this.draghoverPrev = false;
        this.draghoverNext = false;
    }

    onDragStart(event: any) {
        if (this.tree.draggableNodes && (<TreeNode>this.node).draggable !== false) {
            event.dataTransfer.setData('text', 'data');

            this.tree.dragDropService.startDrag({
                tree: this,
                node: this.node,
                subNodes: this.node?.parent ? this.node.parent.children : this.tree.value,
                index: this.index,
                scope: this.tree.draggableScope
            });
        } else {
            event.preventDefault();
        }
    }

    onDragStop(event: any) {
        this.tree.dragDropService.stopDrag({
            node: this.node,
            subNodes: this.node?.parent ? this.node.parent.children : this.tree.value,
            index: this.index
        });
    }

    onDropNodeDragOver(event: any) {
        event.dataTransfer.dropEffect = 'move';
        if (this.tree.droppableNodes) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    onDropNode(event: any) {
        if (this.tree.droppableNodes && this.node?.droppable !== false) {
            let dragNode = this.tree.dragNode;

            if (this.tree.allowDrop(<TreeNode>dragNode, <TreeNode>this.node, this.tree.dragNodeScope)) {
                let dropParams = { ...this.createDropNodeEventMetadata() };

                if (this.tree.validateDrop) {
                    this.tree.onNodeDrop.emit({
                        originalEvent: event,
                        dragNode: dragNode,
                        dropNode: this.node,
                        index: this.index,
                        accept: () => {
                            this.processNodeDrop(dropParams);
                        }
                    });
                } else {
                    this.processNodeDrop(dropParams);
                    this.tree.onNodeDrop.emit({
                        originalEvent: event,
                        dragNode: dragNode,
                        dropNode: this.node,
                        index: this.index
                    });
                }
            }
        }

        event.preventDefault();
        event.stopPropagation();
        this.draghoverNode = false;
    }

    createDropNodeEventMetadata() {
        return {
            dragNode: this.tree.dragNode,
            dragNodeIndex: this.tree.dragNodeIndex,
            dragNodeSubNodes: this.tree.dragNodeSubNodes,
            dropNode: this.node
        };
    }

    processNodeDrop(event: any) {
        let dragNodeIndex = event.dragNodeIndex;
        event.dragNodeSubNodes.splice(dragNodeIndex, 1);

        if (event.dropNode.children) event.dropNode.children.push(event.dragNode);
        else event.dropNode.children = [event.dragNode];

        this.tree.dragDropService.stopDrag({
            node: event.dragNode,
            subNodes: event.dropNode.parent ? event.dropNode.parent.children : this.tree.value,
            index: dragNodeIndex
        });
    }

    onDropNodeDragEnter(event: any) {
        if (this.tree.droppableNodes && this.node?.droppable !== false && this.tree.allowDrop(<TreeNode>this.tree.dragNode, <TreeNode>this.node, this.tree.dragNodeScope)) {
            this.draghoverNode = true;
        }
    }

    onDropNodeDragLeave(event: any) {
        if (this.tree.droppableNodes) {
            let rect = event.currentTarget.getBoundingClientRect();
            if (event.x > rect.left + rect.width || event.x < rect.left || event.y >= Math.floor(rect.top + rect.height) || event.y < rect.top) {
                this.draghoverNode = false;
            }
        }
    }

    onKeyDown(event: KeyboardEvent) {
        if (!this.isSameNode(event) || (this.tree.contextMenu && this.tree.contextMenu.containerViewChild?.nativeElement.style.display === 'block')) {
            return;
        }

        switch (event.code) {
            //down arrow
            case 'ArrowDown':
                this.onArrowDown(event);
                break;

            //up arrow
            case 'ArrowUp':
                this.onArrowUp(event);
                break;

            //right arrow
            case 'ArrowRight':
                this.onArrowRight(event);
                break;

            //left arrow
            case 'ArrowLeft':
                this.onArrowLeft(event);
                break;

            //enter
            case 'Enter':
            case 'Space':
            case 'NumpadEnter':
                this.onEnter(event);
                break;
            //tab
            case 'Tab':
                this.setAllNodesTabIndexes();
                break;

            default:
                //no op
                break;
        }
    }

    onArrowUp(event: KeyboardEvent) {
        const nodeElement = (<HTMLDivElement>event.target).getAttribute('data-pc-section') === 'toggler' ? (<HTMLDivElement>event.target).closest('[role="treeitem"]') : (<HTMLDivElement>event.target).parentElement;

        if (nodeElement.previousElementSibling) {
            this.focusRowChange(nodeElement, nodeElement.previousElementSibling, this.findLastVisibleDescendant(nodeElement.previousElementSibling));
        } else {
            let parentNodeElement = this.getParentNodeElement(nodeElement);

            if (parentNodeElement) {
                this.focusRowChange(nodeElement, parentNodeElement);
            }
        }

        event.preventDefault();
    }

    onArrowDown(event: KeyboardEvent) {
        const nodeElement = (<HTMLDivElement>event.target).getAttribute('data-pc-section') === 'toggler' ? (<HTMLDivElement>event.target).closest('[role="treeitem"]') : <HTMLDivElement>event.target;
        const listElement = nodeElement.children[1];

        if (listElement && listElement.children.length > 0) {
            this.focusRowChange(nodeElement, listElement.children[0]);
        } else {
            if (nodeElement.parentElement.nextElementSibling) {
                this.focusRowChange(nodeElement, nodeElement.parentElement.nextElementSibling);
            } else {
                let nextSiblingAncestor = this.findNextSiblingOfAncestor(nodeElement.parentElement);

                if (nextSiblingAncestor) {
                    this.focusRowChange(nodeElement, nextSiblingAncestor);
                }
            }
        }
        event.preventDefault();
    }

    onArrowRight(event: KeyboardEvent) {
        if (!this.node?.expanded && !this.tree.isNodeLeaf(<TreeNode>this.node)) {
            this.expand(event);
            (<HTMLDivElement>event.currentTarget).tabIndex = -1;

            setTimeout(() => {
                this.onArrowDown(event);
            }, 1);
        }
        event.preventDefault();
    }

    onArrowLeft(event: KeyboardEvent) {
        const nodeElement = (<HTMLDivElement>event.target).getAttribute('data-pc-section') === 'toggler' ? (<HTMLDivElement>event.target).closest('[role="treeitem"]') : <HTMLDivElement>event.target;

        if (this.level === 0 && !this.node?.expanded) {
            return false;
        }

        if (this.node?.expanded) {
            this.collapse(event);
            return;
        }

        let parentNodeElement = this.getParentNodeElement(nodeElement.parentElement);

        if (parentNodeElement) {
            this.focusRowChange(event.currentTarget, parentNodeElement);
        }

        event.preventDefault();
    }

    onEnter(event: KeyboardEvent) {
        this.tree.onNodeClick(event, <TreeNode>this.node);
        this.setTabIndexForSelectionMode(event, this.tree.nodeTouched);
        event.preventDefault();
    }

    setAllNodesTabIndexes() {
        const nodes = <any>find(this.tree.el.nativeElement, '.p-tree-node');

        const hasSelectedNode = [...nodes].some((node) => node.getAttribute('aria-selected') === 'true' || node.getAttribute('aria-checked') === 'true');

        [...nodes].forEach((node) => {
            node.tabIndex = -1;
        });

        if (hasSelectedNode) {
            const selectedNodes = [...nodes].filter((node) => node.getAttribute('aria-selected') === 'true' || node.getAttribute('aria-checked') === 'true');

            selectedNodes[0].tabIndex = 0;

            return;
        }

        if (nodes.length) {
            ([...nodes][0] as any).tabIndex = 0;
        }
    }

    setTabIndexForSelectionMode(event, nodeTouched) {
        if (this.tree.selectionMode !== null) {
            const elements = [...find(this.tree.el.nativeElement, '[role="treeitem"]')];

            event.currentTarget.tabIndex = nodeTouched === false ? -1 : 0;

            if (elements.every((element: any) => element.tabIndex === -1)) {
                (elements[0] as any).tabIndex = 0;
            }
        }
    }

    findNextSiblingOfAncestor(nodeElement: any): any {
        let parentNodeElement = this.getParentNodeElement(nodeElement);

        if (parentNodeElement) {
            if (parentNodeElement.nextElementSibling) return parentNodeElement.nextElementSibling;
            else return this.findNextSiblingOfAncestor(parentNodeElement);
        } else {
            return null;
        }
    }

    findLastVisibleDescendant(nodeElement: any): any {
        const listElement = <HTMLElement>Array.from(nodeElement.children).find((el: any) => hasClass(el, 'p-tree-node'));
        const childrenListElement = listElement?.children[1];
        if (childrenListElement && childrenListElement.children.length > 0) {
            const lastChildElement = childrenListElement.children[childrenListElement.children.length - 1];

            return this.findLastVisibleDescendant(lastChildElement);
        } else {
            return nodeElement;
        }
    }

    getParentNodeElement(nodeElement: HTMLElement | Element) {
        const parentNodeElement = nodeElement.parentElement?.parentElement?.parentElement;

        return parentNodeElement?.tagName === 'P-TREENODE' ? parentNodeElement : null;
    }

    focusNode(element: any) {
        if (this.tree.droppableNodes) (element.children[1] as HTMLElement).focus();
        else (element.children[0] as HTMLElement).focus();
    }

    focusRowChange(firstFocusableRow, currentFocusedRow, lastVisibleDescendant?) {
        firstFocusableRow.tabIndex = '-1';
        currentFocusedRow.children[0].tabIndex = '0';

        this.focusNode(lastVisibleDescendant || currentFocusedRow);
    }

    focusVirtualNode() {
        this.timeout = setTimeout(() => {
            let node = <any>findSingle(this.tree?.contentViewChild.nativeElement, `[data-id="${<TreeNode>this.node?.key ?? <TreeNode>this.node?.data}"]`);
            focus(node);
        }, 1);
    }
}
/**
 * Tree is used to display hierarchical data.
 * @group Components
 */
@Component({
    selector: 'p-tree',
    standalone: true,
    imports: [CommonModule, Scroller, SharedModule, SearchIcon, SpinnerIcon, InputText, FormsModule, IconField, InputIcon, UITreeNode, AutoFocusModule],
    template: `
        <div [class]="cx('mask')" *ngIf="loading && loadingMode === 'mask'">
            <i *ngIf="loadingIcon" [class]="cn(cx('loadingIcon'), 'pi-spin' + loadingIcon)"></i>
            <ng-container *ngIf="!loadingIcon">
                <svg data-p-icon="spinner" *ngIf="!loadingIconTemplate && !_loadingIconTemplate" spin [class]="cx('loadingIcon')" />
                <span *ngIf="loadingIconTemplate || _loadingIconTemplate" [class]="cx('loadingIcon')">
                    <ng-template *ngTemplateOutlet="loadingIconTemplate || _loadingIconTemplate"></ng-template>
                </span>
            </ng-container>
        </div>
        <ng-container *ngTemplateOutlet="headerTemplate || _headerTemplate"></ng-container>
        @if (filterTemplate || _filterTemplate) {
            <ng-container *ngTemplateOutlet="filterTemplate || _filterTemplate; context: { $implicit: filterOptions }"></ng-container>
        } @else {
            <p-iconfield *ngIf="filter" [class]="cx('pcFilterContainer')">
                <input
                    #filter
                    [pAutoFocus]="filterInputAutoFocus"
                    pInputText
                    type="search"
                    autocomplete="off"
                    [class]="cx('pcFilterInput')"
                    [attr.placeholder]="filterPlaceholder"
                    (keydown.enter)="$event.preventDefault()"
                    (input)="_filter($event.target?.value)"
                />
                <p-inputicon>
                    <svg data-p-icon="search" *ngIf="!filterIconTemplate && !_filterIconTemplate" [class]="cx('filterIcon')" />
                    <span *ngIf="filterIconTemplate || _filterIconTemplate" [class]="cx('filterIcon')">
                        <ng-template *ngTemplateOutlet="filterIconTemplate || _filterIconTemplate"></ng-template>
                    </span>
                </p-inputicon>
            </p-iconfield>
        }

        <ng-container *ngIf="getRootNode()?.length">
            <p-scroller
                #scroller
                *ngIf="virtualScroll"
                [items]="serializedValue"
                [tabindex]="-1"
                [styleClass]="cx('wrapper')"
                [style]="{ height: scrollHeight !== 'flex' ? scrollHeight : undefined }"
                [scrollHeight]="scrollHeight !== 'flex' ? undefined : '100%'"
                [itemSize]="virtualScrollItemSize"
                [lazy]="lazy"
                (onScroll)="onScroll.emit($event)"
                (onScrollIndexChange)="onScrollIndexChange.emit($event)"
                (onLazyLoad)="onLazyLoad.emit($event)"
                [options]="virtualScrollOptions"
            >
                <ng-template #content let-items let-scrollerOptions="options">
                    <ul *ngIf="items" #content [class]="cx('rootChildren')" [ngClass]="scrollerOptions.contentStyleClass" [style]="scrollerOptions.contentStyle" role="tree" [attr.aria-label]="ariaLabel" [attr.aria-labelledby]="ariaLabelledBy">
                        <p-treeNode
                            #treeNode
                            *ngFor="let rowNode of items; let firstChild = first; let lastChild = last; let index = index; trackBy: trackBy"
                            [level]="rowNode.level"
                            [rowNode]="rowNode"
                            [node]="rowNode.node"
                            [parentNode]="rowNode.parent"
                            [firstChild]="firstChild"
                            [lastChild]="lastChild"
                            [index]="getIndex(scrollerOptions, index)"
                            [itemSize]="scrollerOptions.itemSize"
                            [indentation]="indentation"
                            [loadingMode]="loadingMode"
                        ></p-treeNode>
                    </ul>
                </ng-template>
                <ng-container *ngIf="loaderTemplate || _loaderTemplate">
                    <ng-template #loader let-scrollerOptions="options">
                        <ng-container *ngTemplateOutlet="loaderTemplate || _loaderTemplate; context: { options: scrollerOptions }"></ng-container>
                    </ng-template>
                </ng-container>
            </p-scroller>
            <ng-container *ngIf="!virtualScroll">
                <div #wrapper [class]="cx('wrapper')" [style.max-height]="scrollHeight">
                    <ul #content [class]="cx('rootChildren')" *ngIf="getRootNode()" role="tree" [attr.aria-label]="ariaLabel" [attr.aria-labelledby]="ariaLabelledBy">
                        <p-treeNode
                            *ngFor="let node of getRootNode(); let firstChild = first; let lastChild = last; let index = index; trackBy: trackBy.bind(this)"
                            [node]="node"
                            [firstChild]="firstChild"
                            [lastChild]="lastChild"
                            [index]="index"
                            [level]="0"
                            [loadingMode]="loadingMode"
                        ></p-treeNode>
                    </ul>
                </div>
            </ng-container>
        </ng-container>

        <div [class]="cx('emptyMessage')" *ngIf="!loading && (getRootNode() == null || getRootNode().length === 0)">
            <ng-container *ngIf="!emptyMessageTemplate && !_emptyMessageTemplate; else emptyFilter">
                {{ emptyMessageLabel }}
            </ng-container>
            <ng-template #emptyFilter *ngTemplateOutlet="emptyMessageTemplate || _emptyMessageTemplate"></ng-template>
        </div>
        <ng-container *ngTemplateOutlet="footerTemplate || _footerTemplate"></ng-container>
    `,
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None,
    providers: [TreeStyle],
    host: {
        '[class]': "cn(cx('root'), styleClass)"
    }
})
export class Tree extends BaseComponent implements OnInit, AfterContentInit, OnChanges, OnDestroy, BlockableUI {
    /**
     * An array of treenodes.
     * @group Props
     */
    @Input() value: TreeNode<any> | TreeNode<any>[] | any[] | any;
    /**
     * Defines the selection mode.
     * @group Props
     */
    @Input() selectionMode: 'single' | 'multiple' | 'checkbox' | null | undefined;
    /**
     * Loading mode display.
     * @group Props
     */
    @Input() loadingMode: 'mask' | 'icon' = 'mask';
    /**
     * A single treenode instance or an array to refer to the selections.
     * @group Props
     */
    @Input() selection: any;
    /**
     * Style class of the component.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    @Input() styleClass: string | undefined;
    /**
     * Context menu instance.
     * @group Props
     */
    @Input() contextMenu: any;
    /**
     * Scope of the draggable nodes to match a droppableScope.
     * @group Props
     */
    @Input() draggableScope: any;
    /**
     * Scope of the droppable nodes to match a draggableScope.
     * @group Props
     */
    @Input() droppableScope: any;
    /**
     * Whether the nodes are draggable.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) draggableNodes: boolean | undefined;
    /**
     * Whether the nodes are droppable.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) droppableNodes: boolean | undefined;
    /**
     * Defines how multiple items can be selected, when true metaKey needs to be pressed to select or unselect an item and when set to false selection of each item can be toggled individually. On touch enabled devices, metaKeySelection is turned off automatically.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) metaKeySelection: boolean = false;
    /**
     * Whether checkbox selections propagate to ancestor nodes.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) propagateSelectionUp: boolean = true;
    /**
     * Whether checkbox selections propagate to descendant nodes.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) propagateSelectionDown: boolean = true;
    /**
     * Displays a loader to indicate data load is in progress.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) loading: boolean | undefined;
    /**
     * The icon to show while indicating data load is in progress.
     * @group Props
     */
    @Input() loadingIcon: string | undefined;
    /**
     * Text to display when there is no data.
     * @group Props
     */
    @Input() emptyMessage: string = '';
    /**
     * Used to define a string that labels the tree.
     * @group Props
     */
    @Input() ariaLabel: string | undefined;
    /**
     * Defines a string that labels the toggler icon for accessibility.
     * @group Props
     */
    @Input() togglerAriaLabel: string | undefined;
    /**
     * Establishes relationships between the component and label(s) where its value should be one or more element IDs.
     * @group Props
     */
    @Input() ariaLabelledBy: string | undefined;
    /**
     * When enabled, drop can be accepted or rejected based on condition defined at onNodeDrop.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) validateDrop: boolean | undefined;
    /**
     * When specified, displays an input field to filter the items.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) filter: boolean | undefined;
    /**
     * Determines whether the filter input should be automatically focused when the component is rendered.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) filterInputAutoFocus: boolean = false;
    /**
     * When filtering is enabled, filterBy decides which field or fields (comma separated) to search against.
     * @group Props
     */
    @Input() filterBy: string = 'label';
    /**
     * Mode for filtering valid values are "lenient" and "strict". Default is lenient.
     * @group Props
     */
    @Input() filterMode: string = 'lenient';
    /**
     * Mode for filtering valid values are "lenient" and "strict". Default is lenient.
     * @group Props
     */
    @Input() filterOptions: any;
    /**
     * Placeholder text to show when filter input is empty.
     * @group Props
     */
    @Input() filterPlaceholder: string | undefined;
    /**
     * Values after the tree nodes are filtered.
     * @group Props
     */
    @Input() filteredNodes: TreeNode<any>[] | undefined | null;
    /**
     * Locale to use in filtering. The default locale is the host environment's current locale.
     * @group Props
     */
    @Input() filterLocale: string | undefined;
    /**
     * Height of the scrollable viewport.
     * @group Props
     */
    @Input() scrollHeight: string | undefined;
    /**
     * Defines if data is loaded and interacted with in lazy manner.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) lazy: boolean = false;
    /**
     * Whether the data should be loaded on demand during scroll.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) virtualScroll: boolean | undefined;
    /**
     * Height of an item in the list for VirtualScrolling.
     * @group Props
     */
    @Input({ transform: numberAttribute }) virtualScrollItemSize: number | undefined;
    /**
     * Whether to use the scroller feature. The properties of scroller component can be used like an object in it.
     * @group Props
     */
    @Input() virtualScrollOptions: ScrollerOptions | undefined;
    /**
     * Indentation factor for spacing of the nested node when virtual scrolling is enabled.
     * @group Props
     */
    @Input({ transform: numberAttribute }) indentation: number = 1.5;
    /**
     * Custom templates of the component.
     * @group Props
     */
    @Input() _templateMap: any;
    /**
     * Function to optimize the node list rendering, default algorithm checks for object identity.
     * @group Props
     */
    @Input() trackBy: Function = (index: number, item: any) => item;
    /**
     * Highlights the node on select.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) highlightOnSelect: boolean = false;
    /**
     * Callback to invoke on selection change.
     * @param {(TreeNode<any> | TreeNode<any>[] | null)} event - Custom selection change event.
     * @group Emits
     */
    @Output() selectionChange: EventEmitter<TreeNode<any> | TreeNode<any>[] | null> = new EventEmitter<TreeNode<any> | TreeNode<any>[] | null>();
    /**
     * Callback to invoke when a node is selected.
     * @param {TreeNodeSelectEvent} event - Node select event.
     * @group Emits
     */
    @Output() onNodeSelect: EventEmitter<TreeNodeSelectEvent> = new EventEmitter<TreeNodeSelectEvent>();
    /**
     * Callback to invoke when a node is unselected.
     * @param {TreeNodeUnSelectEvent} event - Node unselect event.
     * @group Emits
     */
    @Output() onNodeUnselect: EventEmitter<TreeNodeUnSelectEvent> = new EventEmitter<TreeNodeUnSelectEvent>();
    /**
     * Callback to invoke when a node is expanded.
     * @param {TreeNodeExpandEvent} event - Node expand event.
     * @group Emits
     */
    @Output() onNodeExpand: EventEmitter<TreeNodeExpandEvent> = new EventEmitter<TreeNodeExpandEvent>();
    /**
     * Callback to invoke when a node is collapsed.
     * @param {TreeNodeCollapseEvent} event - Node collapse event.
     * @group Emits
     */
    @Output() onNodeCollapse: EventEmitter<TreeNodeCollapseEvent> = new EventEmitter<TreeNodeCollapseEvent>();
    /**
     * Callback to invoke when a node is selected with right click.
     * @param {onNodeContextMenuSelect} event - Node context menu select event.
     * @group Emits
     */
    @Output() onNodeContextMenuSelect: EventEmitter<TreeNodeContextMenuSelectEvent> = new EventEmitter<TreeNodeContextMenuSelectEvent>();
    /**
     * Callback to invoke when a node is double clicked.
     * @param {TreeNodeDoubleClickEvent} event - Node double click event.
     * @group Emits
     */
    @Output() onNodeDoubleClick: EventEmitter<TreeNodeDoubleClickEvent> = new EventEmitter<TreeNodeDoubleClickEvent>();
    /**
     * Callback to invoke when a node is dropped.
     * @param {TreeNodeDropEvent} event - Node drop event.
     * @group Emits
     */
    @Output() onNodeDrop: EventEmitter<TreeNodeDropEvent> = new EventEmitter<TreeNodeDropEvent>();
    /**
     * Callback to invoke in lazy mode to load new data.
     * @param {TreeLazyLoadEvent} event - Custom lazy load event.
     * @group Emits
     */
    @Output() onLazyLoad: EventEmitter<TreeLazyLoadEvent> = new EventEmitter<TreeLazyLoadEvent>();
    /**
     * Callback to invoke in virtual scroll mode when scroll position changes.
     * @param {TreeScrollEvent} event - Custom scroll event.
     * @group Emits
     */
    @Output() onScroll: EventEmitter<TreeScrollEvent> = new EventEmitter<TreeScrollEvent>();
    /**
     * Callback to invoke in virtual scroll mode when scroll position and item's range in view changes.
     * @param {TreeScrollIndexChangeEvent} event - Scroll index change event.
     * @group Emits
     */
    @Output() onScrollIndexChange: EventEmitter<TreeScrollIndexChangeEvent> = new EventEmitter<TreeScrollIndexChangeEvent>();
    /**
     * Callback to invoke when data is filtered.
     * @param {TreeFilterEvent} event - Custom filter event.
     * @group Emits
     */
    @Output() onFilter: EventEmitter<TreeFilterEvent> = new EventEmitter<TreeFilterEvent>();
    /**
     * Filter template.
     * @group Templates
     */
    @ContentChild('filter', { descendants: false }) filterTemplate: TemplateRef<any>;
    /**
     * Node template.
     * @group Templates
     */
    @ContentChild('node', { descendants: false }) nodeTemplate: TemplateRef<any> | undefined;
    /**
     * Header template.
     * @group Templates
     */
    @ContentChild('header', { descendants: false }) headerTemplate: TemplateRef<any> | undefined;
    /**
     * Footer template.
     * @group Templates
     */
    @ContentChild('footer', { descendants: false }) footerTemplate: TemplateRef<any> | undefined;
    /**
     * Loader template.
     * @group Templates
     */
    @ContentChild('loader', { descendants: false }) loaderTemplate: TemplateRef<any> | undefined;
    /**
     * Empty message template.
     * @group Templates
     */
    @ContentChild('empty', { descendants: false }) emptyMessageTemplate: TemplateRef<any> | undefined;
    /**
     * Toggler icon template.
     * @group Templates
     */
    @ContentChild('togglericon', { descendants: false }) togglerIconTemplate: TemplateRef<any> | undefined;
    /**
     * Checkbox icon template.
     * @group Templates
     */
    @ContentChild('checkboxicon', { descendants: false }) checkboxIconTemplate: TemplateRef<any> | undefined;
    /**
     * Loading icon template.
     * @group Templates
     */
    @ContentChild('loadingicon', { descendants: false }) loadingIconTemplate: TemplateRef<any> | undefined;
    /**
     * Filter icon template.
     * @group Templates
     */
    @ContentChild('filtericon', { descendants: false }) filterIconTemplate: TemplateRef<any> | undefined;

    @ViewChild('filter') filterViewChild: Nullable<ElementRef>;

    @ViewChild('scroller') scroller: Nullable<Scroller>;

    @ViewChild('wrapper') wrapperViewChild: Nullable<ElementRef>;

    @ViewChild('content') contentViewChild: Nullable<ElementRef>;

    @ContentChildren(PrimeTemplate) private templates: QueryList<PrimeTemplate> | undefined;

    _headerTemplate: TemplateRef<any> | undefined;

    _emptyMessageTemplate: TemplateRef<any> | undefined;

    _footerTemplate: TemplateRef<any> | undefined;

    _loaderTemplate: TemplateRef<any> | undefined;

    _togglerIconTemplate: TemplateRef<any> | undefined;

    _checkboxIconTemplate: TemplateRef<any> | undefined;

    _loadingIconTemplate: TemplateRef<any> | undefined;

    _filterIconTemplate: TemplateRef<any> | undefined;

    _filterTemplate: TemplateRef<any> | undefined;

    ngAfterContentInit() {
        if ((this.templates as QueryList<PrimeTemplate>).length) {
            this._templateMap = {};
        }

        (this.templates as QueryList<PrimeTemplate>).forEach((item) => {
            switch (item.getType()) {
                case 'header':
                    this._headerTemplate = item.template;
                    break;

                case 'empty':
                    this._emptyMessageTemplate = item.template;
                    break;

                case 'footer':
                    this._footerTemplate = item.template;
                    break;

                case 'loader':
                    this._loaderTemplate = item.template;
                    break;

                case 'togglericon':
                    this._togglerIconTemplate = item.template;
                    break;

                case 'checkboxicon':
                    this._checkboxIconTemplate = item.template;
                    break;

                case 'loadingicon':
                    this._loadingIconTemplate = item.template;
                    break;

                case 'filtericon':
                    this._filterIconTemplate = item.template;
                    break;

                case 'filter':
                    this._filterTemplate = item.template;
                    break;

                default:
                    this._templateMap[<any>item.name] = item.template;
                    break;
            }
        });
    }

    serializedValue: Nullable<TreeNode<any>[]>;

    public nodeTouched: boolean | undefined | null;

    public dragNodeTree: Tree | undefined | null;

    public dragNode: TreeNode<any> | undefined | null;

    public dragNodeSubNodes: TreeNode<any>[] | undefined | null;

    public dragNodeIndex: number | undefined | null;

    public dragNodeScope: any;

    public dragHover: boolean | undefined | null;

    public dragStartSubscription: Subscription | undefined | null;

    public dragStopSubscription: Subscription | undefined | null;

    _componentStyle = inject(TreeStyle);

    @HostListener('drop', ['$event'])
    handleDropEvent(event: DragEvent) {
        this.onDrop(event);
    }

    @HostListener('dragover', ['$event'])
    handleDragOverEvent(event: DragEvent) {
        this.onDragOver(event);
    }

    @HostListener('dragenter')
    handleDragEnterEvent() {
        this.onDragEnter();
    }

    @HostListener('dragleave', ['$event'])
    handleDragLeaveEvent(event: DragEvent) {
        this.onDragLeave(event);
    }

    constructor(@Optional() public dragDropService: TreeDragDropService) {
        super();
    }

    ngOnInit() {
        super.ngOnInit();
        if (this.filterBy) {
            this.filterOptions = {
                filter: (value) => this._filter(value),
                reset: () => this.resetFilter()
            };
        }
        if (this.droppableNodes) {
            this.dragStartSubscription = this.dragDropService.dragStart$.subscribe((event) => {
                this.dragNodeTree = event.tree;
                this.dragNode = event.node;
                this.dragNodeSubNodes = event.subNodes;
                this.dragNodeIndex = event.index;
                this.dragNodeScope = event.scope;
            });

            this.dragStopSubscription = this.dragDropService.dragStop$.subscribe((event) => {
                this.dragNodeTree = null;
                this.dragNode = null;
                this.dragNodeSubNodes = null;
                this.dragNodeIndex = null;
                this.dragNodeScope = null;
                this.dragHover = false;
            });
        }
    }

    ngOnChanges(simpleChange: SimpleChanges) {
        super.ngOnChanges(simpleChange);
        if (simpleChange.value) {
            this.updateSerializedValue();
            if (this.hasFilterActive()) {
                this._filter(this.filterViewChild.nativeElement.value);
            }
        }
    }

    get emptyMessageLabel(): string {
        return this.emptyMessage || this.config.getTranslation(TranslationKeys.EMPTY_MESSAGE);
    }

    updateSerializedValue() {
        this.serializedValue = [];
        this.serializeNodes(null, this.getRootNode(), 0, true);
    }

    serializeNodes(parent: TreeNode<any> | null, nodes: TreeNode<any>[] | any, level: number, visible: boolean) {
        if (nodes && nodes.length) {
            for (let node of nodes) {
                node.parent = parent;
                const rowNode = {
                    node: node,
                    parent: parent,
                    level: level,
                    visible: visible && (parent ? parent.expanded : true)
                };
                (this.serializedValue as TreeNode<any>[]).push(<TreeNode>rowNode);

                if (rowNode.visible && node.expanded) {
                    this.serializeNodes(node, node.children, level + 1, rowNode.visible);
                }
            }
        }
    }

    onNodeClick(event: Event, node: TreeNode) {
        let eventTarget = <Element>event.target;
        if (hasClass(eventTarget, 'p-tree-toggler') || hasClass(eventTarget, 'p-tree-toggler-icon')) {
            return;
        } else if (this.selectionMode) {
            if (node.selectable === false) {
                node.style = '--p-focus-ring-color: none;';
                return;
            } else {
                if (!node.style?.includes('--p-focus-ring-color')) {
                    node.style = node.style ? `${node.style}--p-focus-ring-color: var(--primary-color)` : '--p-focus-ring-color: var(--primary-color)';
                }
            }

            if (this.hasFilteredNodes()) {
                node = this.getNodeWithKey(<string>node.key, <TreeNode<any>[]>this.filteredNodes) as TreeNode;
                if (!node) {
                    return;
                }
            }

            let index = this.findIndexInSelection(node);
            let selected = index >= 0;

            if (this.isCheckboxSelectionMode()) {
                if (selected) {
                    if (this.propagateSelectionDown) this.propagateDown(node, false);
                    else this.selection = this.selection.filter((val: TreeNode, i: number) => i != index);

                    if (this.propagateSelectionUp && node.parent) {
                        this.propagateUp(node.parent, false);
                    }

                    this.selectionChange.emit(this.selection);
                    this.onNodeUnselect.emit({ originalEvent: event, node: node });
                } else {
                    if (this.propagateSelectionDown) this.propagateDown(node, true);
                    else this.selection = [...(this.selection || []), node];

                    if (this.propagateSelectionUp && node.parent) {
                        this.propagateUp(node.parent, true);
                    }

                    this.selectionChange.emit(this.selection);
                    this.onNodeSelect.emit({ originalEvent: event, node: node });
                }
            } else {
                let metaSelection = this.nodeTouched ? false : this.metaKeySelection;

                if (metaSelection) {
                    let metaKey = (<KeyboardEvent>event).metaKey || (<KeyboardEvent>event).ctrlKey;

                    if (selected && metaKey) {
                        if (this.isSingleSelectionMode()) {
                            this.selectionChange.emit(null);
                        } else {
                            this.selection = this.selection.filter((val: TreeNode, i: number) => i != index);
                            this.selectionChange.emit(this.selection);
                        }

                        this.onNodeUnselect.emit({ originalEvent: event, node: node });
                    } else {
                        if (this.isSingleSelectionMode()) {
                            this.selectionChange.emit(<TreeNode>node);
                        } else if (this.isMultipleSelectionMode()) {
                            this.selection = !metaKey ? [] : this.selection || [];
                            this.selection = [...this.selection, node];
                            this.selectionChange.emit(this.selection);
                        }

                        this.onNodeSelect.emit({ originalEvent: event, node: node });
                    }
                } else {
                    if (this.isSingleSelectionMode()) {
                        if (selected) {
                            this.selection = null;
                            this.onNodeUnselect.emit({ originalEvent: event, node: node });
                        } else {
                            this.selection = node;
                            setTimeout(() => {
                                this.onNodeSelect.emit({ originalEvent: event, node: node });
                            });
                        }
                    } else {
                        if (selected) {
                            this.selection = this.selection.filter((val: TreeNode, i: number) => i != index);
                            this.onNodeUnselect.emit({ originalEvent: event, node: node });
                        } else {
                            this.selection = [...(this.selection || []), node];
                            setTimeout(() => {
                                this.onNodeSelect.emit({ originalEvent: event, node: node });
                            });
                        }
                    }

                    this.selectionChange.emit(this.selection);
                }
            }
        }

        this.nodeTouched = false;
    }

    onNodeTouchEnd() {
        this.nodeTouched = true;
    }

    onNodeRightClick(event: MouseEvent, node: TreeNode<any>) {
        if (this.contextMenu) {
            let eventTarget = <Element>event.target;

            if (eventTarget.className && eventTarget.className.indexOf('p-tree-toggler') === 0) {
                return;
            } else {
                let index = this.findIndexInSelection(node);
                let selected = index >= 0;

                if (!selected) {
                    if (this.isSingleSelectionMode()) this.selectionChange.emit(node);
                    else this.selectionChange.emit([node]);
                }

                this.contextMenu.show(event);
                this.onNodeContextMenuSelect.emit({ originalEvent: event, node: node });
            }
        }
    }

    onNodeDblClick(event: MouseEvent, node: TreeNode<any>) {
        this.onNodeDoubleClick.emit({ originalEvent: event, node: node });
    }

    findIndexInSelection(node: TreeNode) {
        let index: number = -1;
        if (this.selectionMode && this.selection) {
            if (this.isSingleSelectionMode()) {
                let areNodesEqual = (this.selection.key && this.selection.key === node.key) || this.selection == node;
                index = areNodesEqual ? 0 : -1;
            } else {
                for (let i = 0; i < this.selection.length; i++) {
                    let selectedNode = this.selection[i];
                    let areNodesEqual = (selectedNode.key && selectedNode.key === node.key) || selectedNode == node;
                    if (areNodesEqual) {
                        index = i;
                        break;
                    }
                }
            }
        }

        return index;
    }

    syncNodeOption(node: TreeNode, parentNodes: TreeNode<any>[], option: any, value?: any) {
        // to synchronize the node option between the filtered nodes and the original nodes(this.value)
        const _node = this.hasFilteredNodes() ? this.getNodeWithKey(<string>node.key, parentNodes) : null;
        if (_node) {
            (<any>_node)[option] = value || (<any>node)[option];
        }
    }

    hasFilteredNodes() {
        return this.filter && this.filteredNodes && this.filteredNodes.length;
    }

    hasFilterActive() {
        return this.filter && this.filterViewChild?.nativeElement?.value.length > 0;
    }

    getNodeWithKey(key: string, nodes: TreeNode<any>[]): TreeNode<any> | undefined {
        for (let node of nodes) {
            if (node.key === key) {
                return node;
            }

            if (node.children) {
                let matchedNode = this.getNodeWithKey(key, node.children);
                if (matchedNode) {
                    return matchedNode;
                }
            }
        }
    }

    propagateUp(node: TreeNode, select: boolean) {
        if (node.children && node.children.length) {
            let selectedCount: number = 0;
            let childPartialSelected: boolean = false;
            for (let child of node.children) {
                if (this.isSelected(child)) {
                    selectedCount++;
                } else if (child.partialSelected) {
                    childPartialSelected = true;
                }
            }

            if (select && selectedCount == node.children.length) {
                this.selection = [...(this.selection || []), node];
                node.partialSelected = false;
            } else {
                if (!select) {
                    let index = this.findIndexInSelection(node);
                    if (index >= 0) {
                        this.selection = this.selection.filter((val: TreeNode, i: number) => i != index);
                    }
                }

                if (childPartialSelected || (selectedCount > 0 && selectedCount != node.children.length)) node.partialSelected = true;
                else node.partialSelected = false;
            }

            this.syncNodeOption(node, <TreeNode<any>[]>this.filteredNodes, 'partialSelected');
        }

        let parent = node.parent;
        if (parent) {
            this.propagateUp(parent, select);
        }
    }

    propagateDown(node: TreeNode, select: boolean) {
        let index = this.findIndexInSelection(node);

        if (select && index == -1) {
            this.selection = [...(this.selection || []), node];
        } else if (!select && index > -1) {
            this.selection = this.selection.filter((val: TreeNode, i: number) => i != index);
        }

        node.partialSelected = false;

        this.syncNodeOption(node, <TreeNode<any>[]>this.filteredNodes, 'partialSelected');

        if (node.children && node.children.length) {
            for (let child of node.children) {
                this.propagateDown(child, select);
            }
        }
    }

    isSelected(node: TreeNode) {
        return this.findIndexInSelection(node) != -1;
    }

    isSingleSelectionMode() {
        return this.selectionMode && this.selectionMode == 'single';
    }

    isMultipleSelectionMode() {
        return this.selectionMode && this.selectionMode == 'multiple';
    }

    isCheckboxSelectionMode() {
        return this.selectionMode && this.selectionMode == 'checkbox';
    }

    isNodeLeaf(node: TreeNode): boolean {
        return node.leaf == false ? false : !(node.children && node.children.length);
    }

    getRootNode() {
        return this.filteredNodes ? this.filteredNodes : this.value;
    }

    getTemplateForNode(node: TreeNode): TemplateRef<any> | null {
        if (this._templateMap) return node.type ? this._templateMap[node.type] : this._templateMap['default'];
        else return null;
    }

    onDragOver(event: DragEvent) {
        if (this.droppableNodes && (!this.value || (<any>this.value).length === 0)) {
            (<any>event).dataTransfer.dropEffect = 'move';
            event.preventDefault();
        }
    }

    onDrop(event: DragEvent) {
        if (this.droppableNodes && (!this.value || (<any>this.value).length === 0)) {
            event.preventDefault();
            let dragNode = this.dragNode as TreeNode;

            if (this.allowDrop(dragNode, null, this.dragNodeScope)) {
                let dragNodeIndex = <number>this.dragNodeIndex;
                this.value = this.value || [];

                if (this.validateDrop) {
                    this.onNodeDrop.emit({
                        originalEvent: event,
                        dragNode: dragNode,
                        dropNode: null,
                        index: dragNodeIndex,
                        accept: () => {
                            this.processTreeDrop(dragNode, dragNodeIndex);
                        }
                    });
                } else {
                    this.onNodeDrop.emit({
                        originalEvent: event,
                        dragNode: dragNode,
                        dropNode: null,
                        index: dragNodeIndex
                    });

                    this.processTreeDrop(dragNode, dragNodeIndex);
                }
            }
        }
    }

    processTreeDrop(dragNode: TreeNode, dragNodeIndex: number) {
        (<TreeNode<any>[]>this.dragNodeSubNodes).splice(dragNodeIndex, 1);
        (this.value as TreeNode<any>[]).push(dragNode);
        this.dragDropService.stopDrag({
            node: dragNode
        });
    }

    onDragEnter() {
        if (this.droppableNodes && this.allowDrop(<TreeNode>this.dragNode, null, this.dragNodeScope)) {
            this.dragHover = true;
        }
    }

    onDragLeave(event: DragEvent) {
        if (this.droppableNodes) {
            let rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
            if (event.x > rect.left + rect.width || event.x < rect.left || event.y > rect.top + rect.height || event.y < rect.top) {
                this.dragHover = false;
            }
        }
    }

    allowDrop(dragNode: TreeNode, dropNode: TreeNode<any> | null, dragNodeScope: any): boolean {
        if (!dragNode) {
            //prevent random html elements to be dragged
            return false;
        } else if (this.isValidDragScope(dragNodeScope)) {
            let allow: boolean = true;
            if (dropNode) {
                if (dragNode === dropNode) {
                    allow = false;
                } else {
                    let parent = dropNode.parent;
                    while (parent != null) {
                        if (parent === dragNode) {
                            allow = false;
                            break;
                        }
                        parent = parent.parent;
                    }
                }
            }

            return allow;
        } else {
            return false;
        }
    }

    isValidDragScope(dragScope: any): boolean {
        let dropScope = this.droppableScope;

        if (dropScope) {
            if (typeof dropScope === 'string') {
                if (typeof dragScope === 'string') return dropScope === dragScope;
                else if (Array.isArray(dragScope)) return (<Array<any>>dragScope).indexOf(dropScope) != -1;
            } else if (Array.isArray(dropScope)) {
                if (typeof dragScope === 'string') {
                    return (<Array<any>>dropScope).indexOf(dragScope) != -1;
                } else if (Array.isArray(dragScope)) {
                    for (let s of dropScope) {
                        for (let ds of dragScope) {
                            if (s === ds) {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        } else {
            return true;
        }
    }

    public _filter(value: string) {
        let filterValue = value;
        if (filterValue === '') {
            this.filteredNodes = null;
        } else {
            this.filteredNodes = [];
            const searchFields: string[] = this.filterBy.split(',');
            const filterText = removeAccents(filterValue).toLocaleLowerCase(this.filterLocale);
            const isStrictMode = this.filterMode === 'strict';
            for (let node of <TreeNode<any>[]>this.value) {
                let copyNode = { ...node };
                let paramsWithoutNode = { searchFields, filterText, isStrictMode };
                if (
                    (isStrictMode && (this.findFilteredNodes(copyNode, paramsWithoutNode) || this.isFilterMatched(copyNode, paramsWithoutNode))) ||
                    (!isStrictMode && (this.isFilterMatched(copyNode, paramsWithoutNode) || this.findFilteredNodes(copyNode, paramsWithoutNode)))
                ) {
                    this.filteredNodes.push(copyNode);
                }
            }
        }

        this.updateSerializedValue();
        this.onFilter.emit({
            filter: filterValue,
            filteredValue: this.filteredNodes
        });
    }

    /**
     * Resets filter.
     * @group Method
     */
    public resetFilter() {
        this.filteredNodes = null;

        if (this.filterViewChild && this.filterViewChild.nativeElement) {
            this.filterViewChild.nativeElement.value = '';
        }
    }
    /**
     * Scrolls to virtual index.
     * @param {number} number - Index to be scrolled.
     * @group Method
     */
    public scrollToVirtualIndex(index: number) {
        this.virtualScroll && this.scroller?.scrollToIndex(index);
    }
    /**
     * Scrolls to virtual index.
     * @param {ScrollToOptions} options - Scroll options.
     * @group Method
     */
    public scrollTo(options: any) {
        if (this.virtualScroll) {
            this.scroller?.scrollTo(options);
        } else if (this.wrapperViewChild && this.wrapperViewChild.nativeElement) {
            if (this.wrapperViewChild.nativeElement.scrollTo) {
                this.wrapperViewChild.nativeElement.scrollTo(options);
            } else {
                this.wrapperViewChild.nativeElement.scrollLeft = options.left;
                this.wrapperViewChild.nativeElement.scrollTop = options.top;
            }
        }
    }

    findFilteredNodes(node: TreeNode, paramsWithoutNode: any) {
        if (node) {
            let matched = false;
            if (node.children) {
                let childNodes = [...node.children];
                node.children = [];
                for (let childNode of childNodes) {
                    let copyChildNode = { ...childNode };
                    if (this.isFilterMatched(copyChildNode, paramsWithoutNode)) {
                        matched = true;
                        node.children.push(copyChildNode);
                    }
                }
            }

            if (matched) {
                node.expanded = true;
                return true;
            }
        }
    }

    isFilterMatched(node: TreeNode, params: any) {
        let { searchFields, filterText, isStrictMode } = params;
        let matched = false;
        for (let field of searchFields) {
            let fieldValue = removeAccents(String(resolveFieldData(node, field))).toLocaleLowerCase(this.filterLocale);
            if (fieldValue.indexOf(filterText) > -1) {
                matched = true;
            }
        }

        if (!matched || (isStrictMode && !this.isNodeLeaf(node))) {
            matched = this.findFilteredNodes(node, { searchFields, filterText, isStrictMode }) || matched;
        }

        return matched;
    }

    getIndex(options: any, index: number) {
        const getItemOptions = options['getItemOptions'];
        return getItemOptions ? getItemOptions(index).index : index;
    }

    getBlockableElement(): HTMLElement {
        return this.el.nativeElement.children[0];
    }

    ngOnDestroy() {
        if (this.dragStartSubscription) {
            this.dragStartSubscription.unsubscribe();
        }

        if (this.dragStopSubscription) {
            this.dragStopSubscription.unsubscribe();
        }

        super.ngOnDestroy();
    }
}
@NgModule({
    imports: [Tree, SharedModule],
    exports: [Tree, SharedModule]
})
export class TreeModule {}
